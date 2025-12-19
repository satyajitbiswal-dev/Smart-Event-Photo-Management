from celery import shared_task
import exifread
from .models import Photo

#generating exif data
@shared_task(
    bind=True,
    # autoretry_for=(Exception,),
    # retry_kwargs={'max_retries': 3, 'countdown': 5},
)
#add exif data to photo asynchronously
def extract_exif(self,photo_id):
    photo_instance = Photo.objects.filter(photo_id=photo_id).first()
    with photo_instance.photo.open('rb') as f:
        tags = exifread.process_file(f, details=False)

    # Camera model
    make = tags.get("Image Make")
    model = tags.get("Image Model")
    photo_instance.camera_model = f"{make} {model}" if make and model else None

    # Shutter speed
    if "EXIF ExposureTime" in tags:
        photo_instance.shutter_speed = str(tags["EXIF ExposureTime"])
    elif "EXIF ShutterSpeedValue" in tags:
        photo_instance.shutter_speed = str(tags["EXIF ShutterSpeedValue"])
    else:
        photo_instance.shutter_speed = None

    # Aperture
    if "EXIF FNumber" in tags:
        photo_instance.aperture = f"f/{tags['EXIF FNumber']}"
    elif "EXIF ApertureValue" in tags:
        photo_instance.aperture = str(tags["EXIF ApertureValue"])
    else:
        photo_instance.aperture = None

    # GPS
    if "GPS GPSLatitude" in tags and "GPS GPSLatitudeRef" in tags:
        photo_instance.gps_latitude= dms_to_decimal(
            tags["GPS GPSLatitude"].values,
            tags["GPS GPSLatitudeRef"].values
        )
    else:
        photo_instance.gps_latitude = None

    if "GPS GPSLongitude" in tags and "GPS GPSLongitudeRef" in tags:
        photo_instance.gps_longitude = dms_to_decimal(
            tags["GPS GPSLongitude"].values,
            tags["GPS GPSLongitudeRef"].values
        )
    else:
        photo_instance.gps_longitude = None
    print("Exists in celery:", Photo.objects.filter(photo_id=photo_id).exists())
    photo_instance.save()


def dms_to_decimal(dms, ref):
    degrees = float(dms[0])
    minutes = float(dms[1])
    seconds = float(dms[2].num) / float(dms[2].den)

    decimal = degrees + minutes / 60 + seconds / 3600
    if ref in ['S', 'W']:
        decimal = -decimal
    return decimal



#add thumbnail asynchrnously
from PIL import Image, ImageFont, ImageDraw
from io import BytesIO
from django.core.files.base import ContentFile
import os

@shared_task
def generate_thumbnail(photo_id): #PNG ka nhi bana rha hai
    photo = Photo.objects.filter(photo_id=photo_id).first() #get the photo object
    # create thumbnail
    img = Image.open(photo.photo)
    img.thumbnail(size=(200,200))
    # convert into bytes and save
    new_img_io = BytesIO()
    img.save(new_img_io,format='JPEG')
    #get name 
    photo_name = os.path.basename(photo.photo.name)
    thumbnail_name = f"thumbnail_{photo_name}"
    photo.thumbnail.save(
        name=thumbnail_name,
        content=ContentFile(new_img_io.getvalue()),
        save=True
    )
    

#add watermarked Image asynchronously
@shared_task
def add_watermark(photo_id, watermark_text):
    photo = Photo.objects.filter(photo_id=photo_id).first()
    # Open image
    base_image = Image.open(photo.photo).convert("RGBA")
    width, height = base_image.size

    # Create transparent overlay
    overlay = Image.new("RGBA", base_image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    # Diagonal line pattern
    line_color = (255, 255, 255, 30)
    for i in range(-height, width, 80):
        draw.line(
            [(i, 0), (i + height, height)],
            fill=line_color,
            width=5
        )

    # Font handling (SAFE)
    font_size = min(width, height) // 8
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    # Correct text size calculation
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text
    x = (width - text_width) // 2
    y = (height - text_height) // 2

    text_color = (255, 255, 255, 90)
    draw.text((x, y), watermark_text, fill=text_color, font=font)

    # Merge overlay with base image
    watermarked = Image.alpha_composite(base_image, overlay)
    watermarked = watermarked.convert("RGB")
    watermarked_io = BytesIO()
    watermarked.save(watermarked_io,format='JPEG')
    #get base name
    photo_name = os.path.basename(photo.photo.name)
    watermarked_image_name = f"watermarked_{photo_name}"
    #save
    photo.watermarked_image.save(
        name=watermarked_image_name,
        content=ContentFile(watermarked_io.getvalue()),
        save=True
    )


from .predict import get_predictions
from .models import Tag

@shared_task
def generate_tag(photo_id):
    photo = Photo.objects.filter(photo_id=photo_id).first()
    prediction_list = get_predictions(photo.photo.path)
    tags = []
    for prediction in prediction_list:
        if prediction["confidence"] >= 0.25:
            tag_instance = Tag.objects.get_or_create(tag_name=prediction["label"])[0]
            tags.append(tag_instance)
    photo.tag.add(*tags)
    print(prediction_list)

