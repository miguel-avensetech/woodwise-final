# WoodWise Machine Learning Setup Guide

## Complete Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 18+ (already installed for Next.js)
- At least 2GB free disk space
- Internet connection for downloading dependencies

---

## Part 1: Collect Training Images

### Step 1: Create Dataset Folders

Navigate to the ML API directory and create the dataset structure:

```bash
cd "WoodWise website/ml-api"
mkdir dataset
mkdir dataset\mahogany
mkdir dataset\not_mahogany
mkdir models
```

### Step 2: Collect Mahogany Images

**Where to put images:** `ml-api/dataset/mahogany/`

**Sources for mahogany images:**

1. **Take Your Own Photos**
   - Photograph mahogany furniture (tables, chairs, cabinets)
   - Use good lighting
   - Take multiple angles
   - Include close-ups of wood grain

2. **Download from Internet**
   - Google Images: Search "mahogany wood texture"
   - Unsplash.com: Free high-quality images
   - Pexels.com: Free stock photos
   - Pixabay.com: Free images

3. **Recommended Search Terms:**
   - "mahogany wood texture"
   - "mahogany furniture"
   - "mahogany wood grain"
   - "mahogany table"
   - "mahogany chair"

**How many images:** Minimum 100, recommended 300-500

### Step 3: Collect Non-Mahogany Images

**Where to put images:** `ml-api/dataset/not_mahogany/`

**Include various wood types:**
- Oak
- Pine
- Maple
- Walnut
- Cherry
- Teak
- Bamboo

**Same sources as mahogany images**

**How many images:** Minimum 100, recommended 300-500

### Image Guidelines:
- ✅ Clear, well-lit photos
- ✅ Various angles and distances
- ✅ Different wood conditions (new, aged, polished)
- ✅ JPG or PNG format
- ✅ At least 224x224 pixels
- ❌ Avoid blurry images
- ❌ Avoid images with text overlays
- ❌ Avoid heavily filtered images

---

## Part 2: Install Python Dependencies

### Step 1: Install Python

If you don't have Python installed:
1. Download from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation:
   ```bash
   python --version
   ```

### Step 2: Install ML Dependencies

```bash
cd "WoodWise website/ml-api"
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- TensorFlow (machine learning)
- Pillow (image processing)
- NumPy (numerical computing)

**Note:** This may take 5-10 minutes and download ~500MB

---

## Part 3: Train the Model

### Step 1: Verify Dataset

Check that you have images in both folders:
```bash
dir dataset\mahogany
dir dataset\not_mahogany
```

### Step 2: Run Training Script

```bash
python train_model.py
```

**What happens:**
- Loads all images from dataset folders
- Preprocesses and augments images
- Trains a neural network model
- Saves the trained model to `models/mahogany_detector.h5`

**Training time:** 30-60 minutes (depends on dataset size and computer speed)

**Expected output:**
```
Creating model...
Model Summary:
...
Preparing data...
Found 400 images belonging to 2 classes.
Found 100 images belonging to 2 classes.
Training model...
Epoch 1/50
...
Model saved to models/mahogany_detector.h5
Training complete!
```

---

## Part 4: Start the ML API

### Option A: Using Batch File (Windows)

```bash
start.bat
```

### Option B: Manual Start

```bash
python app.py
```

**Expected output:**
```
Model loaded successfully!
 * Running on http://0.0.0.0:5000
```

**Keep this terminal window open!** The API needs to run while using the website.

---

## Part 5: Configure Next.js Frontend

### Step 1: Create Environment File

In the `WoodWise website` directory, create `.env.local`:

```env
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

### Step 2: Restart Next.js Development Server

```bash
cd "WoodWise website"
npm run dev
```

---

## Part 6: Test the Integration

### Step 1: Open the Website

Navigate to: http://localhost:3000

### Step 2: Sign In

1. Go to Sign In page
2. Enter any credentials (demo mode)
3. You'll be redirected to dashboard

### Step 3: Test Scanning

1. Click "Scan" in the navigation
2. Click "Upload Photo"
3. Select a mahogany wood image
4. Click "Analyze Image"
5. Wait for results (2-5 seconds)

### Expected Results:

```
Analysis Results
Wood Type: Mahogany
Confidence: 95.3%
Status: No issues found

Recommendations:
- Regular Maintenance
  Your mahogany furniture is in good condition...
```

---

## Troubleshooting

### Problem: "Model not found" error

**Solution:**
1. Check if `models/mahogany_detector.h5` exists
2. If not, run `python train_model.py` again
3. Make sure training completed successfully

### Problem: "Connection refused" error

**Solution:**
1. Make sure ML API is running (`python app.py`)
2. Check if port 5000 is available
3. Verify `.env.local` has correct URL

### Problem: Low accuracy (< 70%)

**Solution:**
1. Collect more training images (aim for 500+ per class)
2. Ensure images are diverse and clear
3. Retrain the model with more epochs
4. Check if images are correctly categorized

### Problem: "Out of memory" during training

**Solution:**
1. Reduce batch size in `train_model.py` (change BATCH_SIZE to 16 or 8)
2. Close other applications
3. Use smaller images
4. Train on a computer with more RAM

### Problem: Slow predictions

**Solution:**
1. Model is loading for first prediction (normal)
2. Subsequent predictions should be faster
3. Consider using a GPU for faster inference

---

## Testing the API Directly

### Test Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Test Prediction Endpoint

```bash
curl -X POST -F "image=@path/to/test/image.jpg" http://localhost:5000/predict
```

---

## Production Deployment

For deploying to production:

1. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Deploy to cloud:**
   - AWS EC2 or Lambda
   - Google Cloud Run
   - Azure App Service
   - Heroku

3. **Update frontend environment:**
   ```env
   NEXT_PUBLIC_ML_API_URL=https://your-api-domain.com
   ```

---

## Next Steps

1. **Improve the model:**
   - Add more training data
   - Train for defect detection (mold, cracks, scratches)
   - Fine-tune hyperparameters

2. **Add features:**
   - Save scan history to database
   - Generate PDF reports
   - Email notifications for maintenance

3. **Optimize performance:**
   - Add caching
   - Compress images before upload
   - Use CDN for faster delivery

---

## Support

If you encounter issues:
1. Check the console logs (both Flask and Next.js)
2. Verify all dependencies are installed
3. Ensure dataset is properly organized
4. Review the error messages carefully

For more help, refer to:
- TensorFlow documentation: https://www.tensorflow.org/
- Flask documentation: https://flask.palletsprojects.com/
- Next.js documentation: https://nextjs.org/docs
