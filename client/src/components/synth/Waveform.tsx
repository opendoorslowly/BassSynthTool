import { useEffect, useRef } from 'react';
import { getAudioIntensity, getWaveformData } from '@/lib/audio';

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
      const waveformData = getWaveformData();

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const hue = 200 + intensity * 120; // Shift hue based on intensity
      gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue + 60}, 70%, 50%, 0.8)`);
      gradient.addColorStop(1, `hsla(${hue + 120}, 70%, 50%, 0.8)`);

      // Draw waveform
      const width = rect.width;
      const height = rect.height;
      const sliceWidth = width / waveformData.length;

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add shadow for glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${hue}, 70%, 50%, 0.5)`;

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

      // Draw background glow
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = `hsla(${hue}, 50%, 15%, 0.1)`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

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
      className="w-full h-24 rounded-lg bg-black/90"
      style={{ width: '100%', height: '96px' }}
    />
  );
}