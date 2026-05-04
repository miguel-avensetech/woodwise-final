"""
Flask API for YOLOv8 Mahogany Wood Classification
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Model path
MODEL_PATH = 'runs/classify/runs/classify/mahogany_classifier/weights/best.pt'
model = None

def load_model():
    """Load the trained YOLOv8 model"""
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = YOLO(MODEL_PATH)
            print(f"✓ Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"✗ Error loading model: {e}")
            model = None
    else:
        print(f"⚠️  Warning: Model not found at {MODEL_PATH}")
        print("Please train the model first using: python train_model.py")

def analyze_wood_features(image):
    """
    Analyze wood features from the image
    Returns color, texture, and grain information
    """
    # Convert PIL image to numpy array
    img_array = np.array(image)
    
    # Calculate average color
    avg_color = img_array.mean(axis=(0, 1))
    
    # Determine wood color description
    r, g, b = avg_color
    if r > 150 and g < 100:
        color_desc = "Reddish-brown"
    elif r > 120 and g > 80 and b < 80:
        color_desc = "Medium brown"
    elif r < 100 and g < 80:
        color_desc = "Dark brown"
    else:
        color_desc = "Light brown"
    
    # Calculate texture (standard deviation as roughness indicator)
    gray = img_array.mean(axis=2)
    texture_variance = gray.std()
    
    if texture_variance > 50:
        texture_desc = "Coarse grain"
    elif texture_variance > 30:
        texture_desc = "Medium grain"
    else:
        texture_desc = "Fine grain"
    
    return {
        "color": color_desc,
        "texture": texture_desc,
        "grain_pattern": "Straight grain" if texture_variance < 40 else "Interlocked grain"
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict if uploaded image is mahogany wood
    Expects: multipart/form-data with 'image' file
    Returns: JSON with prediction results
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                "error": "No image provided",
                "message": "Please upload an image file"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "error": "Empty filename"
            }), 400
        
        # Check if model is loaded
        if model is None:
            return jsonify({
                "error": "Model not loaded",
                "message": "The classification model is not available. Please train the model first."
            }), 503
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save temp file for YOLO prediction
        temp_path = 'temp_image.jpg'
        image.save(temp_path)
        
        # Run prediction 
        results = model(temp_path, verbose=False)
        result = results[0]
        
        # Get prediction details
        class_id = result.probs.top1
        confidence = result.probs.top1conf.item()
        class_name = result.names[class_id]
        
        # Get all class probabilities
        probs = result.probs.data.cpu().numpy()
        
        # Analyze wood features
        features = analyze_wood_features(image)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Determine if it's mahogany
        is_mahogany = class_name.lower() == 'mahogany'
        confidence_percent = confidence * 100
        
        # Prepare response
        response = {
            "is_mahogany": is_mahogany,
            "wood_type": "Mahogany" if is_mahogany else "Non-Mahogany",
            "confidence": round(confidence_percent, 2),
            "class_name": class_name,
            "features": features,
            "all_probabilities": {
                result.names[i]: round(float(probs[i]) * 100, 2) 
                for i in range(len(probs))
            },
            "status": "success"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500

@app.route('/predict-base64', methods=['POST'])
def predict_base64():
    """
    Predict from base64 encoded image
    Expects: JSON with 'image' field containing base64 string
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "error": "No image data provided"
            }), 400
        
        # Decode base64 image
        import base64
        image_data = data['image']
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Check if model is loaded
        if model is None:
            return jsonify({
                "error": "Model not loaded",
                "message": "The classification model is not available."
            }), 503
        
        # Process image
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save temp file
        temp_path = 'temp_image.jpg'
        image.save(temp_path)
        
        # Run prediction (verbose=False to suppress console output)
        results = model(temp_path, verbose=False)
        result = results[0]
        
        class_id = result.probs.top1
        confidence = result.probs.top1conf.item()
        class_name = result.names[class_id]
        
        # Analyze features
        features = analyze_wood_features(image)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        is_mahogany = class_name.lower() == 'mahogany'
        
        response = {
            "is_mahogany": is_mahogany,
            "wood_type": "Mahogany" if is_mahogany else "Non-Mahogany",
            "confidence": round(confidence * 100, 2),
            "features": features,
            "status": "success"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in base64 prediction: {e}")
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    print("="*60)
    print("YOLOv8 Mahogany Wood Classifier API")
    print("="*60)
    load_model()
    print("\nStarting Flask server on http://localhost:5000")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)
