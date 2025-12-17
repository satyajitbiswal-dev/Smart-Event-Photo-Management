import exifread

# Open image file
path = "C:\\Users\\Satya\\OneDrive\\Desktop\\Smart Event Photo Management\\smart-event-photo-management\\backend\\apps\\photo\\Pentax_K10D.jpg"
with open(path, 'rb') as f:
    tags = exifread.process_file(f)

# Print all tags
print(tags.get('Image Orientation'))
for tag, value in tags.items():
    print(f"{tag:25}: {value}")

def convert_gps(coordinate):
    """Convert GPS coordinates to decimal degrees"""
    d, m, s = coordinate.values
    return d + m/60 + s/3600

# Extract and convert GPS data
if 'GPS GPSLatitude' in tags:
    lat = convert_gps(tags['GPS GPSLatitude'])
    lon = convert_gps(tags['GPS GPSLongitude'])
    print(f"Location: {lat}, {lon}")

