# How to Start the ML Server

## The Error

```
classify-wood (failed) net::ERR_INTERNET_DISCONNECTED
```

This means the Python Flask server for wood classification is **not running**.

## Quick Fix

### Step 1: Open a New Terminal

Keep your Next.js dev server running, and open a **new terminal window**.

### Step 2: Navigate to the ML API Directory

```bash
cd app/api/wood-classifier
```

### Step 3: Start the Flask Server

```bash
python app.py
```

You should see:

```
YOLOv8 Mahogany Wood Classifier API
============================================================
✓ Model loaded successfully from runs/classify/runs/classify/mahogany_classifier/weights/best.pt
Starting Flask server on http://localhost:5000
============================================================
 * Debugger is active!
 * Debugger PIN: xxx-xxx-xxx
```

### Step 4: Test Your Scan

Now go back to your browser and try scanning furniture again. The wood classification should work!

## Keep Both Servers Running

You need **TWO terminal windows**:

**Terminal 1: Next.js Dev Server**
```bash
npm run dev
```
Running on: http://localhost:3000

**Terminal 2: Python ML Server**
```bash
cd app/api/wood-classifier
python app.py
```
Running on: http://localhost:5000

## Troubleshooting

### "python: command not found"

Try `python3` instead:
```bash
python3 app.py
```

### "No module named 'flask'" or other import errors

Install dependencies:
```bash
pip install flask flask-cors ultralytics pillow numpy opencv-python
```

Or if using pip3:
```bash
pip3 install flask flask-cors ultralytics pillow numpy opencv-python
```

### "Model file not found"

Make sure you have the trained model at:
```
app/api/wood-classifier/runs/classify/runs/classify/mahogany_classifier/weights/best.pt
```

If not, you need to train the model first:
```bash
cd app/api/wood-classifier
python train_yolov8.py
```

### Port 5000 already in use

Kill the process using port 5000:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

Or change the port in `app.py` and `.env.local`:

**app.py:**
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
```

**.env.local:**
```env
NEXT_PUBLIC_ML_API_URL=http://localhost:5001
ML_API_URL=http://localhost:5001
```

## Alternative: Run in Background

### Windows (PowerShell):
```powershell
cd app/api/wood-classifier
Start-Process python -ArgumentList "app.py" -WindowStyle Hidden
```

### Mac/Linux:
```bash
cd app/api/wood-classifier
python app.py &
```

## Automatic Startup (Optional)

### Option 1: Use npm scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "ml": "cd app/api/wood-classifier && python app.py",
    "dev:all": "concurrently \"npm run dev\" \"npm run ml\""
  }
}
```

Install concurrently:
```bash
npm install --save-dev concurrently
```

Then run both servers:
```bash
npm run dev:all
```

### Option 2: Create a startup script

**start-all.bat (Windows):**
```batch
@echo off
start cmd /k "npm run dev"
timeout /t 3
start cmd /k "cd app/api/wood-classifier && python app.py"
```

**start-all.sh (Mac/Linux):**
```bash
#!/bin/bash
npm run dev &
sleep 3
cd app/api/wood-classifier && python app.py &
```

Make executable:
```bash
chmod +x start-all.sh
```

Run:
```bash
./start-all.sh
```

## Checking if ML Server is Running

Open your browser and go to:
```
http://localhost:5000
```

You should see:
```json
{
  "status": "ok",
  "message": "YOLOv8 Mahogany Wood Classifier API is running"
}
```

If you see this, the server is working!

## Summary

**The fix is simple:**

1. Open a new terminal
2. Run: `cd app/api/wood-classifier`
3. Run: `python app.py`
4. Keep it running while using the app

That's it! Your wood classification will now work. 🎉
