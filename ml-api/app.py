from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = 'models/mahogany_detector.h5'
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully!")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}")
        print("Please train and save your model first.")

def preprocess_image(image_bytes):
    """
    Preprocess the image for model prediction
    """
    # Open image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to model input size (adjust based on your model)
    img = img.resize((224, 224))
    
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def detect_defects(image_array):
    """
    Detect wood defects (mold, cracks, scratches)
    This is a placeholder - implement based on your trained model
    """
    # Placeholder logic - replace with actual defect detection
    defects = []
    
    # Simulate defect detection
    confidence = np.random.random()
    
    if confidence > 0.7:
        defects.append({
            "type": "surface_scratches",
            "severity": "minor",
            "confidence": float(confidence)
        })
    elif confidence > 0.5:
        defects.append({
            "type": "discoloration",
            "severity": "slight",
            "confidence": float(confidence)
        })
    
    return defects

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                "error": "No image provided"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "error": "Empty filename"
            }), 400
        
        # Read image bytes
        image_bytes = file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        if model is None:
            # Fallback if model not loaded
            is_mahogany = True
            confidence = 0.85
        else:
            prediction = model.predict(processed_image)
            confidence = float(prediction[0][0])
            is_mahogany = confidence > 0.5
        
        # Detect defects
        defects = detect_defects(processed_image)
        
        # Prepare response
        response = {
            "is_mahogany": is_mahogany,
            "confidence": confidence,
            "wood_type": "Mahogany" if is_mahogany else "Not Mahogany",
            "defects": defects,
            "status": "No issues found" if len(defects) == 0 else f"{len(defects)} issue(s) detected",
            "recommendations": generate_recommendations(is_mahogany, defects)
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

def generate_recommendations(is_mahogany, defects):
    """
    Generate treatment recommendations based on wood type and defects
    """
    recommendations = []
    
    if not is_mahogany:
        recommendations.append({
            "title": "Wood Type Mismatch",
            "description": "This does not appear to be mahogany wood. Treatment recommendations may not be optimal.",
            "priority": "high"
        })
        return recommendations
    
    if len(defects) == 0:
        recommendations.append({
            "title": "Regular Maintenance",
            "description": "Your mahogany furniture is in good condition. Apply wood polish every 3 months.",
            "priority": "low"
        })
    else:
        for defect in defects:
            if defect["type"] == "surface_scratches":
                recommendations.append({
                    "title": "Surface Treatment",
                    "description": "Apply mahogany wood filler and sand gently. Follow with wood polish.",
                    "priority": "medium"
                })
            elif defect["type"] == "discoloration":
                recommendations.append({
                    "title": "Color Restoration",
                    "description": "Clean with wood cleaner and apply mahogany-specific stain to restore color.",
                    "priority": "medium"
                })
            elif defect["type"] == "mold":
                recommendations.append({
                    "title": "Mold Treatment",
                    "description": "Clean with anti-mold solution. Ensure proper ventilation to prevent recurrence.",
                    "priority": "high"
                })
    
    return recommendations

if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5000, debug=True)
