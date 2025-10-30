from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import cv2
import numpy as np
import base64
from ultralytics import YOLO
from PIL import Image

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your models
veg_model = YOLO("models/best.pt")
soil_model = YOLO("models/yolo_soil_seg_best.pt")

@app.post("/predict/")
async def predict(file: UploadFile = File(...), model_type: str = Form(...)):
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")  # ensure RGB

        # Resize to 640x640 before inference
        img_resized = img.resize((640, 640))
        img_np = np.array(img_resized)

        # Select model
        model = soil_model if model_type == "Soil Detection" else veg_model

        # Run prediction
        results = model.predict(img_np, conf=0.25, verbose=False)

        # Draw boxes on image
        annotated_img = results[0].plot()  # OpenCV (BGR)
        annotated_img = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)  # convert to RGB before saving

        # Encode image to base64
        _, buffer = cv2.imencode(".jpg", annotated_img)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        # Extract prediction data
        preds = []
        for box in results[0].boxes:
            preds.append({
                "class": model.names[int(box.cls)],
                "confidence": round(float(box.conf), 2)
            })

        return JSONResponse(content={"predictions": preds, "image": img_base64})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
