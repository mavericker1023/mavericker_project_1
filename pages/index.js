import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    try {
      const response = await axios.post("/api/runpod", { image: base64Image });
      setResultImage(`data:image/png;base64,${response.data.output}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>ComfyUI Image Transformer</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Transform Image"}
        </button>
      </form>
      {resultImage && (
        <div style={{ marginTop: "20px" }}>
          <h2>Transformed Image</h2>
          <img src={resultImage} alt="Result" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
}