import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader, Subset

print("Loading dataset from local PlantVillage directory...")
dataset_dir = os.path.join(os.path.dirname(__file__), "PlantVillage-Dataset", "raw", "color")

if not os.path.exists(dataset_dir):
    print(f"Error: Dataset directory {dataset_dir} not found. Please ensure the git clone completed.")
    exit(1)

# Define transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load dataset
full_dataset = datasets.ImageFolder(root=dataset_dir, transform=transform)

# Map labels: Healthy (0) vs Diseased (1)
# Create a target_transform or just iterate and modify the targets
class_names = full_dataset.classes
healthy_classes = [c for c in class_names if 'healthy' in c.lower()]

print(f"Total classes: {len(class_names)}")
print(f"Healthy classes: {healthy_classes}")

# We'll use a custom wrapper to map labels on the fly
class BinaryPlantDataset(torch.utils.data.Dataset):
    def __init__(self, original_dataset, healthy_class_indices):
        self.dataset = original_dataset
        self.healthy_indices = healthy_class_indices
        
    def __len__(self):
        return len(self.dataset)
        
    def __getitem__(self, idx):
        image, label = self.dataset[idx]
        binary_label = 0 if label in self.healthy_indices else 1
        return image, binary_label

healthy_indices = [full_dataset.class_to_idx[c] for c in healthy_classes]
binary_dataset = BinaryPlantDataset(full_dataset, healthy_indices)

# Determine device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Subset for faster training if on CPU
num_samples = None if torch.cuda.is_available() else 1000
if num_samples is not None:
    # Shuffle and pick a subset
    indices = torch.randperm(len(binary_dataset))[:num_samples]
    binary_dataset = Subset(binary_dataset, indices)
    
train_loader = DataLoader(binary_dataset, batch_size=32, shuffle=True)

# Initialize MobileNetV2
print("Initializing MobileNetV2 model...")
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

# Freeze early layers for faster training
for param in model.features[:-4].parameters():
    param.requires_grad = False

# Replace classifier for binary classification
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

num_epochs = 1
print(f"Starting training for {num_epochs} epoch(s)...")

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for i, (inputs, labels) in enumerate(train_loader):
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
        if (i + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{num_epochs}], Step [{i+1}/{len(train_loader)}], Loss: {loss.item():.4f}, Acc: {100 * correct / total:.2f}%")

    print(f"Epoch {epoch+1} completed. Average Loss: {running_loss/len(train_loader):.4f}, Accuracy: {100 * correct / total:.2f}%")

# Save the trained model
save_path = os.path.join(os.path.dirname(__file__), "disease_model.pth")
torch.save(model.state_dict(), save_path)
print(f"Model saved to {save_path}")
