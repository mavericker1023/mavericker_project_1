import axios from "axios";
const sharp = require("sharp"); // npm install sharp 필요

// Vercel 타임아웃을 60초로 늘림 (최대값)
export const config = {
  api: {
    bodyParser: { sizeLimit: "50mb" }, // 이미지 크기 제한 50MB로 늘림
    timeout: 60000, // 60초 타임아웃 (Vercel 최대)
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;
  console.log("Received image size (base64):", image ? image.length : "No image data");

  try {
    let optimizedImage = image;
    if (image) {
      console.log("Optimizing base64 image...");
      const base64Data = image.split(",")[1]; // base64 데이터만 추출 (헤더 제거)
      const buffer = Buffer.from(base64Data, "base64");
      console.log("Raw image size (bytes):", buffer.length);

      // 이미지 압축/최적화 (sharp 사용)
      const optimizedBuffer = await sharp(buffer)
        .resize(256, 256, { fit: "inside" }) // 최대 256x256로 리사이징
        .jpeg({ quality: 50 }) // JPEG로 변환, 품질 50%
        .toBuffer();

      // 최적화된 base64로 변환
      optimizedImage = `data:image/jpeg;base64,${optimizedBuffer.toString("base64")}`;
      console.log("Optimized image size (base64):", optimizedImage.length);
    }

    console.log("Sending request to RunPod with optimized image size:", optimizedImage.length);
    const response = await axios.post(
      "https://api.runpod.ai/v2/bmr96x370lmqv3/run",
      { input: { image: optimizedImage } },
      {
        headers: {
          Authorization: "Bearer rpa_C1076HGF7B4EGX7XOFW5P7NGHIHWDR96LSMM8BRR1wnszp",
          "Content-Type": "application/json",
        },
        timeout: 1200000, // 20분 타임아웃 (큰 이미지 처리 시간 충분히 확보)
      }
    );

    const jobId = response.data.id;
    console.log("Job ID:", jobId);

    let result;
    let attempts = 0;
    const maxAttempts = 1200; // 20분 대기 (1200초, 큰 이미지 처리에 충분)

    while (attempts < maxAttempts) {
      console.log(`Status check attempt ${attempts + 1}/${maxAttempts} for job ${jobId}`);
      const status = await axios.get(
        `https://api.runpod.ai/v2/bmr96x370lmqv3/status/${jobId}`,
        {
          headers: { Authorization: "Bearer rpa_C1076HGF7B4EGX7XOFW5P7NGHIHWDR96LSMM8BRR1wnszp" },
          timeout: 20000, // 상태 확인 타임아웃 20초로 늘림
        }
      );
      console.log("Status check response:", status.data.status);

      if (status.data.status === "COMPLETED") {
        result = status.data.output;
        console.log("Job completed with output size:", result ? result.length : "No output");
        break;
      } else if (status.data.status === "FAILED") {
        throw new Error("Job failed: " + (status.data.error || "No error details"));
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기 유지
      attempts++;
    }

    if (!result) throw new Error("Timeout waiting for job completion after 20 minutes");

    res.status(200).json({ output: result });
  } catch (error) {
    console.error("RunPod Error:", {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}