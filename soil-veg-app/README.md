🌱 Soil & Vegetation Classifier — Full Stack ML Project

This project classifies soil types and detects vegetation using trained YOLOv8/YOLOv11 models, integrated into a FastAPI backend and React frontend.

🧠 Project Structure
backend/   → FastAPI + YOLO models (Python)
frontend/  → React app for image upload & prediction
run_all.bat → Launches both frontend & backend


🧩 Prerequisites

Before running this project, ensure you have:

Python 3.10.x or older

Node.js (LTS)

Git (optional, for cloning repo)

To verify installation:

python --version
node --version
npm --version



⚙️ Setup Instructions
1️⃣ Clone or Download the Repository
git clone https://github.com/shah7-ctrl/AI-Driven-Archaeological-Site-Mapping.git
cd AI-Driven-Archaeological-Site-Mapping/soil-veg-app


Or, download the ZIP from GitHub and extract it, then open the soil-veg-app folder.

⚠️ Model weights are not included in this repo.
Download them manually from Google Drive, rename vegetation model weight as "best.pt" and soil model weight as "yolo_soil_seg_best.pt" and place them inside backend/models/ before running.


2️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt


Run the backend:

uvicorn main:app --reload


Backend runs at → http://127.0.0.1:8000


3️⃣ Frontend Setup

Open a new terminal window:

cd frontend
npm install
npm start


Frontend runs at → http://localhost:3000


4️⃣ Run Both at Once (Windows)

Instead of opening two terminals, double-click:

run_all.bat



🧪 Usage

Open the React web app

Choose a model (Soil / Vegetation)

Upload or drag an image

View the predictions + confidence scores + annotated results

Download prediction image if needed


🧰 Tech Stack

FastAPI (Python Backend)

React (Frontend UI)

YOLOv8/YOLOv11 (Ultralytics)

OpenCV, Pillow, NumPy

CORS Middleware (FastAPI-React communication)