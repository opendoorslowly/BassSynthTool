import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAudioIntensity } from "@/lib/audio";

export default function ReactiveBackground({ children }: { children: React.ReactNode }) {
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

  // Calculate background color based on intensity
  const hue = 200 + intensity * 60; // Shift hue from blue to purple
  const saturation = 40 + intensity * 30; // Increase saturation with intensity
  const lightness = 30 + intensity * 20; // Increase brightness with intensity

  return (
    <motion.div
      className="fixed inset-0 -z-10"
      animate={{
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
