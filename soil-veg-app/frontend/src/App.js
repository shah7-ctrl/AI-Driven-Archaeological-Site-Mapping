import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [model, setModel] = useState("Soil Detection");
  const [loading, setLoading] = useState(false);

  // Convert and resize image before upload (to 640x640)
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 640;
          canvas.height = 640;
          ctx.drawImage(img, 0, 0, 640, 640);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }, "image/jpeg");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    const resizedFile = await resizeImage(selectedFile);
    setFile(resizedFile);
    setPreview(URL.createObjectURL(resizedFile));
    setResultImage(null);
    setPredictions([]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const handlePredict = async () => {
    if (!file) return alert("Please upload an image first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_type", model);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        responseType: "json",
      });

      setPredictions(response.data.predictions);
      setResultImage(`data:image/jpeg;base64,${response.data.image}`);
    } catch (error) {
      console.error(error);
      alert("Prediction failed. Make sure FastAPI backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌱 Soil & Vegetation Detection</h1>
      <p style={styles.subtitle}>Upload or drag an image below to get predictions.</p>

      <select
        style={styles.dropdown}
        value={model}
        onChange={(e) => setModel(e.target.value)}
      >
        <option value="Soil Detection">Soil Detection</option>
        <option value="Vegetation Detection">Vegetation Detection</option>
      </select>

      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>📂 Drag & drop an image here, or click to select</p>
      </div>

      {preview && (
        <div style={styles.previewBox}>
          <h3>Uploaded Image:</h3>
          <img src={preview} alt="preview" style={styles.fixedImage} />
        </div>
      )}

      <button style={styles.button} onClick={handlePredict} disabled={loading}>
        {loading ? "Analyzing..." : "Run Prediction"}
      </button>

      {resultImage && (
        <div style={styles.results}>
          <h2>Predictions:</h2>
          {predictions.map((p, idx) => (
            <p key={idx}>
              <b>{p.class}</b> — Confidence: {p.confidence}
            </p>
          ))}
          <h3>Detected Result:</h3>
          <img src={resultImage} alt="result" style={styles.fixedImage} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Poppins, sans-serif",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#555",
    marginBottom: "20px",
  },
  dropdown: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  dropzone: {
    border: "2px dashed #aaa",
    borderRadius: "12px",
    padding: "40px",
    background: "#fafafa",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "0.3s",
  },
  previewBox: {
    marginBottom: "20px",
  },
  fixedImage: {
    width: "640px",
    height: "640px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    objectFit: "cover",
  },
  button: {
    backgroundColor: "#2d8659",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  results: {
    marginTop: "30px",
    textAlign: "center",
  },
};

export default App;
