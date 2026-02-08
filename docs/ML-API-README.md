# WoodWise ML API - Mahogany Detection

This is the machine learning API for detecting mahogany wood and identifying defects.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd "WoodWise website/ml-api"
pip install -r requirements.txt
```

### 2. Prepare Training Dataset

Create a dataset folder with the following structure:

```
ml-api/
├── dataset/
│   ├── mahogany/          # Put mahogany wood images here
│   │   ├── mahogany_001.jpg
│   │   ├── mahogany_002.jpg
│   │   ├── mahogany_003.jpg
│   │   └── ... (at least 100-500 images recommended)
│   │
│   └── not_mahogany/      # Put non-mahogany wood images here
│       ├── oak_001.jpg
│       ├── pine_001.jpg
│       ├── other_001.jpg
│       └── ... (at least 100-500 images recommended)
```

### 3. Image Collection Guidelines

#### Where to Get Images:

1. **Your Own Photos**
   - Take photos of mahogany furniture
   - Take photos of other wood types
   - Use consistent lighting
   - Various angles and distances

2. **Online Datasets**
   - Kaggle wood datasets
   - Google Images (with proper licensing)
   - Wood texture databases
   - Furniture catalogs

3. **Image Requirements**
   - Format: JPG, PNG
   - Minimum size: 224x224 pixels
   - Clear, well-lit images
   - Various conditions (new, aged, treated, untreated)

#### Dataset Size Recommendations:

- **Minimum**: 100 images per class (200 total)
- **Good**: 500 images per class (1000 total)
- **Excellent**: 1000+ images per class (2000+ total)

### 4. Train the Model

```bash
python train_model.py
```

This will:
- Load and preprocess your images
- Train a CNN model using transfer learning (MobileNetV2)
- Save the trained model to `models/mahogany_detector.h5`
- Training takes 30-60 minutes depending on dataset size

### 5. Start the API Server

```bash
python app.py
```

The API will run on `http://localhost:5000`

### 6. Configure Next.js Frontend

Create a `.env.local` file in the `WoodWise website` directory:

```env
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

### 7. Test the API

#### Health Check:
```bash
curl http://localhost:5000/health
```

#### Test Prediction:
```bash
curl -X POST -F "image=@path/to/test/image.jpg" http://localhost:5000/predict
```

## API Endpoints

### GET /health
Check if API and model are loaded

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### POST /predict
Analyze an image for mahogany detection

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "is_mahogany": true,
  "confidence": 0.95,
  "wood_type": "Mahogany",
  "defects": [
    {
      "type": "surface_scratches",
      "severity": "minor",
      "confidence": 0.78
    }
  ],
  "status": "1 issue(s) detected",
  "recommendations": [
    {
      "title": "Surface Treatment",
      "description": "Apply mahogany wood filler and sand gently...",
      "priority": "medium"
    }
  ]
}
```

## Model Architecture

- **Base Model**: MobileNetV2 (pre-trained on ImageNet)
- **Input Size**: 224x224x3
- **Output**: Binary classification (Mahogany / Not Mahogany)
- **Additional Layers**:
  - Global Average Pooling
  - Dense (128 units, ReLU)
  - Dropout (0.2)
  - Dense (1 unit, Sigmoid)

## Improving Model Accuracy

1. **Collect More Data**
   - Add more diverse images
   - Include various lighting conditions
   - Different wood finishes and ages

2. **Data Augmentation**
   - Already implemented in training script
   - Rotation, flipping, zooming

3. **Fine-tuning**
   - Unfreeze some base model layers
   - Train for more epochs
   - Adjust learning rate

4. **Add Defect Detection**
   - Create separate dataset for defects
   - Train multi-class or multi-label model
   - Detect: mold, cracks, scratches, discoloration

## Troubleshooting

### Model Not Loading
- Check if `models/mahogany_detector.h5` exists
- Retrain the model if corrupted

### Low Accuracy
- Need more training data
- Images may be too similar
- Try data augmentation
- Increase training epochs

### API Connection Error
- Ensure Flask server is running
- Check firewall settings
- Verify CORS is enabled

### Memory Issues
- Reduce batch size in training
- Use smaller image size
- Close other applications

## Production Deployment

For production, consider:

1. **Use a proper server** (Gunicorn, uWSGI)
2. **Add authentication** (API keys)
3. **Rate limiting**
4. **Image size limits**
5. **Caching predictions**
6. **Deploy on cloud** (AWS, Google Cloud, Azure)

## Advanced Features (Future)

- Multi-class wood type detection
- Defect severity scoring
- Treatment cost estimation
- Before/after comparison
- Historical tracking
