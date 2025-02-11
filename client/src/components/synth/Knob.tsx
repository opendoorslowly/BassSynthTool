import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface KnobProps {
  label: string;
  onChange: (value: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
}

export default function Knob({
  label,
  onChange,
  defaultValue = 0.5,
  min = 0,
  max = 1,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const rotation = useMotionValue(0);
  const value = useTransform(rotation, [-150, 150], [min, max]);

  useEffect(() => {
    const initialRotation = ((defaultValue - min) / (max - min)) * 300 - 150;
    rotation.set(initialRotation);
  }, []);

  useEffect(() => {
    const unsubscribe = value.on("change", (v) => {
      onChange(v);
    });
    return () => unsubscribe();
  }, [value, onChange]);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const delta = e.movementY;
    rotation.set(Math.max(-150, Math.min(150, rotation.get() - delta)));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="w-16 h-16 rounded-full bg-gray-700 cursor-pointer relative"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{ rotate: rotation }}
      >
        <div className="absolute top-2 left-1/2 w-1 h-4 bg-white -translate-x-1/2" />
      </motion.div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
