"""
YOLOv8 Classification Training Script for Mahogany Wood Detection
Binary classification: Mahogany vs Non-Mahogany
"""
from ultralytics import YOLO
import os
from pathlib import Path

def train_mahogany_classifier():
    """Train YOLOv8 classification model for mahogany detection"""
    
    print("="*60)
    print("YOLOv8 MAHOGANY WOOD CLASSIFIER TRAINING")
    print("="*60)
    
    # Dataset path
    dataset_path = Path('dataset')
    
    # Check dataset
    mahogany_count = len(list((dataset_path / 'mahogany').glob('*.*')))
    non_mahogany_count = len(list((dataset_path / 'non_mahogany').glob('*.*')))
    
    print(f"\nDataset Summary:")
    print(f"  Mahogany images: {mahogany_count}")
    print(f"  Non-mahogany images: {non_mahogany_count}")
    print(f"  Total images: {mahogany_count + non_mahogany_count}")
    
    if mahogany_count == 0 or non_mahogany_count == 0:
        print("\n❌ Error: Dataset is incomplete!")
        print("Please ensure both 'mahogany' and 'non_mahogany' folders contain images.")
        return
    
    # Initialize YOLOv8 classification model
    print("\n📦 Loading YOLOv8 nano classification model...")
    model = YOLO('yolov8n-cls.pt')  # nano model for faster training
    
    # Training parameters
    print("\n🚀 Starting training...")
    print("This may take 30-60 minutes depending on your hardware.")
    
    results = model.train(
        data=str(dataset_path),
        epochs=50,              # Number of training epochs
        imgsz=224,              # Image size (224x224 is standard for classification)
        batch=16,               # Batch size (adjust based on GPU memory)
        patience=10,            # Early stopping patience
        save=True,              # Save checkpoints
        project='runs/classify',
        name='mahogany_classifier',
        exist_ok=True,
        pretrained=True,
        optimizer='Adam',
        lr0=0.001,              # Initial learning rate
        lrf=0.01,               # Final learning rate
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        cos_lr=True,            # Cosine learning rate scheduler
        label_smoothing=0.1,
        dropout=0.0,
        val=True,
        plots=True,
        verbose=True
    )
    
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETED!")
    print("="*60)
    
    # Model location
    model_path = Path('runs/classify/mahogany_classifier/weights/best.pt')
    print(f"\n📁 Best model saved at: {model_path}")
    
    # Validation results
    print("\n📊 Training Results:")
    print(f"  Final accuracy: {results.results_dict.get('metrics/accuracy_top1', 'N/A')}")
    
    # Test the model
    print("\n🧪 Testing model...")
    test_model(str(model_path))
    
    print("\n" + "="*60)
    print("🎉 Ready to use!")
    print("="*60)
    print("\nTo start the API server:")
    print("  python app.py")
    print("\nOr on Windows:")
    print("  python app.py")

def test_model(model_path):
    """Test the trained model with sample predictions"""
    try:
        model = YOLO(model_path)
        
        # Test with a mahogany sample
        mahogany_samples = list(Path('dataset/mahogany').glob('*.jpg'))[:3]
        non_mahogany_samples = list(Path('dataset/non_mahogany').glob('*.jpg'))[:3]
        
        print("\n  Testing with mahogany samples:")
        for img in mahogany_samples:
            results = model(str(img))
            pred_class = results[0].names[results[0].probs.top1]
            confidence = results[0].probs.top1conf.item() * 100
            print(f"    {img.name}: {pred_class} ({confidence:.1f}%)")
        
        print("\n  Testing with non-mahogany samples:")
        for img in non_mahogany_samples:
            results = model(str(img))
            pred_class = results[0].names[results[0].probs.top1]
            confidence = results[0].probs.top1conf.item() * 100
            print(f"    {img.name}: {pred_class} ({confidence:.1f}%)")
            
    except Exception as e:
        print(f"  ⚠️  Could not test model: {e}")

if __name__ == "__main__":
    train_mahogany_classifier()
