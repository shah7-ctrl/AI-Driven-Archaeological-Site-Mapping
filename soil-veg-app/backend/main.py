from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import cv2
import numpy as np
import base64

app = FastAPI()

# Allow React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both YOLO models
soil_model = YOLO("models/yolo_soil_seg_best.pt")
veg_model = YOLO("models/best.pt")

@app.post("/predict/")
async def predict(file: UploadFile = File(...), model_type: str = Form("Soil Detection")):
    # Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Select model safely (case-insensitive)
    model_type_clean = model_type.lower().strip()
    if model_type_clean == "soil detection":
        model = soil_model
        print("🧱 Using Soil Detection model")
    else:
        model = veg_model
        print("🌿 Using Vegetation Detection model")

    # Run YOLO prediction
    results = model.predict(source=np.array(image), conf=0.1, imgsz=640)
    annotated = results[0].plot()  # annotated image from YOLO
    annotated = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)

    # Convert annotated image to base64 for frontend
    _, img_encoded = cv2.imencode('.jpg', annotated)
    img_base64 = base64.b64encode(img_encoded).decode("utf-8")

    # Extract predictions
    predictions = []
    for box in results[0].boxes:
        cls_id = int(box.cls)
        conf = float(box.conf)
        predictions.append({
            "class": results[0].names[cls_id],
            "confidence": round(conf, 2)
        })

    print(f"✅ Predictions: {predictions}")

    return {
        "predictions": predictions,
        "image": img_base64
    }
