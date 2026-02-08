"""
Training script for mahogany wood detection model
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
DATASET_PATH = 'dataset'  # Path to your training data

def create_model():
    """
    Create a CNN model for mahogany detection
    Using transfer learning with MobileNetV2
    """
    # Load pre-trained MobileNetV2
    base_model = keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Create model
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )
    
    return model

def prepare_data():
    """
    Prepare training and validation data
    """
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        validation_split=0.2
    )
    
    # Training data
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='training'
    )
    
    # Validation data
    validation_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation'
    )
    
    return train_generator, validation_generator

def train():
    """
    Train the model
    """
    print("Creating model...")
    model = create_model()
    
    print("\nModel Summary:")
    model.summary()
    
    print("\nPreparing data...")
    train_gen, val_gen = prepare_data()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3
        ),
        keras.callbacks.ModelCheckpoint(
            'models/mahogany_detector_best.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
    
    print("\nTraining model...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks
    )
    
    # Save final model
    os.makedirs('models', exist_ok=True)
    model.save('models/mahogany_detector.h5')
    print("\nModel saved to models/mahogany_detector.h5")
    
    return model, history

if __name__ == '__main__':
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        print("\nPlease organize your dataset as follows:")
        print("dataset/")
        print("  ├── mahogany/")
        print("  │   ├── image1.jpg")
        print("  │   ├── image2.jpg")
        print("  │   └── ...")
        print("  └── not_mahogany/")
        print("      ├── image1.jpg")
        print("      ├── image2.jpg")
        print("      └── ...")
    else:
        model, history = train()
        print("\nTraining complete!")
