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
    // Set initial rotation based on default value
    const initialRotation = ((defaultValue - min) / (max - min)) * 300 - 150;
    rotation.set(initialRotation);
  }, [defaultValue, min, max, rotation]);

  useEffect(() => {
    const unsubscribe = value.on("change", (v) => {
      // Clamp value between min and max
      const clampedValue = Math.min(max, Math.max(min, v));
      onChange(clampedValue);
    });
    return () => unsubscribe();
  }, [value, onChange, min, max]);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    // Adjust sensitivity for more precise control
    const sensitivity = 0.5;
    const delta = e.movementY * sensitivity;
    rotation.set(Math.max(-150, Math.min(150, rotation.get() - delta)));
  };

  // Calculate the background color based on rotation
  const getRotationColor = (currentRotation: number) => {
    const normalized = (currentRotation + 150) / 300;
    return `hsl(200, 50%, ${50 + normalized * 20}%)`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="w-16 h-16 rounded-full bg-gray-800 cursor-pointer relative shadow-lg"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{ 
          rotate: rotation,
          background: rotation.get() ? getRotationColor(rotation.get()) : undefined
        }}
      >
        <div className="absolute top-2 left-1/2 w-1 h-4 bg-white -translate-x-1/2 rounded-full" />
      </motion.div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}