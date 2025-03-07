import axios from "axios";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};
// 테스트 환경

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body;
  console.log("Received image size:", image.length);

  try {
    console.log("Sending request to RunPod...");
    const response = await axios.post(
      "https://api.runpod.ai/v2/f7yb0x443iv7na/run",
      { input: { image } },
      {
        headers: {
          Authorization: "Bearer rpa_C1076HGF7B4EGX7XOFW5P7NGHIHWDR96LSMM8BRR1wnszp",
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5분 타임아웃
      }
    );

    const jobId = response.data.id;
    console.log("Job ID:", jobId);

    let result;
    let attempts = 0;
    const maxAttempts = 300; // 5분 대기 (300초)

    while (attempts < maxAttempts) {
      const status = await axios.get(
        `https://api.runpod.ai/v2/f7yb0x443iv7na/status/${jobId}`,
        {
          headers: { Authorization: "Bearer rpa_C1076HGF7B4EGX7XOFW5P7NGHIHWDR96LSMM8BRR1wnszp" },
          timeout: 10000,
        }
      );
      console.log("Status check:", status.data.status);

      if (status.data.status === "COMPLETED") {
        result = status.data.output;
        console.log("Job completed:", result);
        break;
      } else if (status.data.status === "FAILED") {
        throw new Error("Job failed: " + status.data.error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!result) throw new Error("Timeout waiting for job completion");

    res.status(200).json(result);
  } catch (error) {
    console.error("RunPod Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
}