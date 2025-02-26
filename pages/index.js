import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [prompt, setPrompt] = useState(''); // 프롬프트 상태
  const [imageUrl, setImageUrl] = useState(null); // 생성된 이미지 URL
  const [loading, setLoading] = useState(false); // 로딩 상태

  // RunPod 엔드포인트로 요청 보내는 함수
  const generateImage = async () => {
    if (!prompt) return;

    setLoading(true);
    try {
      const response = await fetch('https://api.runpod.ai/v2/hkhn1mwo0hoaic/runsync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer rpa_C1076HGF7B4EGX7XOFW5P7NGHIHWDR96LSMM8BRR1wnszp', // RunPod에서 받은 API 키 입력
        },
        body: JSON.stringify({
          input: {
            prompt: prompt // 간단히 프롬프트만 전달하는 예제
          },
        }),
      });

      const data = await response.json();
      console.log('API Response:', data); // 전체 응답 데이터 확인
      console.log('Output data:', data.output); // output 데이터 확인
      console.log('Images array:', data.output.images); // 이미지 배열 확인

      if (data.status === 'COMPLETED') {
        // output.images 배열에서 첫 번째 이미지를 가져옴
        const base64Image = data.output.images[0];
        console.log('Base64 Image:', base64Image);
        setImageUrl(base64Image); // 이미 base64 형식이므로 그대로 사용
      } else {
        console.error('Image generation failed:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ComfyUI Image Generator</title>
        <meta name="description" content="Generate images with ComfyUI and RunPod" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>ComfyUI Image Generator</h1>

        <div className={styles.grid}>
          <div className={styles.inputContainer}>
            <div className={styles.inputContainer} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}> 
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your detailed prompt here..."
                className={styles.input}
                disabled={loading}
                rows={4}
              />
              <button
                onClick={generateImage}
                className={styles.button}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <div className={styles.loadingSpinner}>Generating...</div>
                ) : (
                  'Generate Image'
                )}
              </button>
            </div>
          </div>

          <div className={styles.imageContainer}>
            {loading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner}>Generating your image...</div>
              </div>
            )}
            {imageUrl && (
              <div className={styles.card}>
                <h2>Generated Image</h2>
                <img 
                  src={imageUrl} 
                  alt="Generated" 
                  className={styles.generatedImage}
                  onClick={() => window.open(imageUrl, '_blank')}
                  style={{ width: '100%', height: 'auto' }}
                />
                <p className={styles.promptText}>Prompt: {prompt}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>

      <style jsx>{`
        .${styles.inputContainer} {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .${styles.input} {
          width: 100%;
          padding: 15px;
          margin-bottom: 15px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 16px;
          resize: vertical;
          transition: border-color 0.3s ease;
        }
        .${styles.input}:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0,112,243,0.1);
        }
        .${styles.button} {
          width: 100%;
          padding: 15px 25px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .${styles.button}:hover:not(:disabled) {
          background-color: #0051b3;
          transform: translateY(-1px);
        }
        .${styles.button}:disabled {
          background-color: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .${styles.imageContainer} {
          width: 100%;
          max-width: 800px;
          margin: 20px auto;
          position: relative;
        }
        .${styles.card} {
          padding: 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .${styles.card}:hover {
          transform: translateY(-5px);
        }
        .${styles.generatedImage} {
          width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .${styles.generatedImage}:hover {
          transform: scale(1.02);
        }
        .${styles.promptText} {
          margin-top: 15px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 6px;
          font-size: 14px;
          color: #666;
        }
        .${styles.loadingSpinner} {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .${styles.loadingSpinner}::after {
          content: '';
          width: 20px;
          height: 20px;
          border: 3px solid #ffffff;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .${styles.loadingOverlay} {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}