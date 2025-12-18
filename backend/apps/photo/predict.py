import torch
from torchvision import transforms
from PIL import Image
from .mlmodel import model,LABELS

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

def get_predictions(image_path, top_k=3):
    img = Image.open(image_path).convert("RGB")
    tensor = preprocess(img).unsqueeze(0)

    with torch.no_grad():
        out = model(tensor)
        probs = torch.softmax(out[0], dim=0)

    top_probs, top_idxs = torch.topk(probs, top_k)

    return [
        {
            "label": LABELS[idx],
            "confidence": float(prob)
        }
        for idx, prob in zip(top_idxs, top_probs)
    ]
# photo = "C:\\Users\\Satya\\OneDrive\\Desktop\\Smart Event Photo Management\\smart-event-photo-management\\backend\\apps\\photo\\tiger.jpg"

# print(get_predictions(photo))