import axios from "axios";

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
  console.log("Received image size:", image ? image.length : "No image data");

  try {
    console.log("Sending request to RunPod with image size:", image.length);
    const response = await axios.post(
      "https://api.runpod.ai/v2/bmr96x370lmqv3/run",
      { input: { image } },
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
        console.log("Job completed with output:", result);
        break;
      } else if (status.data.status === "FAILED") {
        throw new Error("Job failed: " + (status.data.error || "No error details"));
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기 유지
      attempts++;
    }

    if (!result) throw new Error("Timeout waiting for job completion after 20 minutes");

    res.status(200).json(result);
  } catch (error) {
    console.error("RunPod Error:", {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}