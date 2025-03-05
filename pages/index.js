import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      img.onload = () => {
        const maxSize = 256; // 최대 크기 256x256로 줄임
        let width = maxSize;
        let height = maxSize;
        if (img.width > img.height) {
          height = Math.round((img.height / img.width) * maxSize);
        } else {
          width = Math.round((img.width / img.height) * maxSize);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.5 // 품질 50%
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

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
    try {
      const resizedBlob = await resizeImage(file);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result.split(",")[1] || ""; // 기본값 빈 문자열
        console.log("Resized base64 size:", base64Image.length);

        const response = await axios.post("/api/runpod", { image: base64Image }, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setResultImage(`data:image/jpeg;base64,${response.data.output}`);
      };
      reader.readAsDataURL(resizedBlob);
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