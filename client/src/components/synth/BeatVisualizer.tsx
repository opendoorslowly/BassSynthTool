import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAudioIntensity } from "@/lib/audio";

export default function BeatVisualizer() {
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    let animationFrame: number;

    const updateIntensity = () => {
      const currentIntensity = getAudioIntensity();
      setIntensity(currentIntensity);
      animationFrame = requestAnimationFrame(updateIntensity);
    };

    updateIntensity();
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
      <motion.div
        className="w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm"
        animate={{
          scale: 1 + intensity * 2,
          opacity: 0.2 + intensity * 0.8
        }}
        transition={{
          duration: 0.1,
          ease: "linear"
        }}
      />
    </div>
  );
}
