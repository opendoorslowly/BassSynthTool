import { useEffect, useRef } from 'react';
import { getAudioIntensity } from '@/lib/audio';

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Animation function
    const draw = () => {
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get audio data
      const intensity = getAudioIntensity();
      const waveformData = new Float32Array(64); // Placeholder for actual waveform data
      for (let i = 0; i < 64; i++) {
        waveformData[i] = Math.sin(i * 0.2 + Date.now() * 0.01) * intensity;
      }

      // Draw waveform
      const width = rect.width;
      const height = rect.height;
      const sliceWidth = width / waveformData.length;

      ctx.beginPath();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;

      for (let i = 0; i < waveformData.length; i++) {
        const x = i * sliceWidth;
        const y = (waveformData[i] + 1) / 2 * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 rounded-lg bg-white/90"
      style={{ width: '100%', height: '96px' }}
    />
  );
}
