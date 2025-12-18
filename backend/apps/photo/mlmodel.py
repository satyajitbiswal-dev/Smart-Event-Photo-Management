import torch
from torchvision import models

model = models.resnet50(
    weights=models.ResNet50_Weights.IMAGENET1K_V1
)
model.eval()

LABELS = models.ResNet50_Weights.IMAGENET1K_V1.meta["categories"]

