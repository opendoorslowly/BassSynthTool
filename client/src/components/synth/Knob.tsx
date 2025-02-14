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
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const initialRotation = ((defaultValue - min) / (max - min)) * 300 - 150;
    rotation.set(initialRotation);
  }, [defaultValue, min, max, rotation]);

  useEffect(() => {
    const unsubscribe = value.on("change", (v) => {
      const clampedValue = Math.min(max, Math.max(min, v));
      onChange(clampedValue);
    });
    return () => unsubscribe();
  }, [value, onChange, min, max]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    // Calculate the vertical distance moved
    const deltaY = startY - e.clientY;

    // Use a higher sensitivity for more responsive movement
    const sensitivity = 3;
    const rotationDelta = deltaY * sensitivity;

    // Update rotation with clamping
    const newRotation = Math.max(-150, Math.min(150, rotation.get() + rotationDelta));
    rotation.set(newRotation);

    // Update the start position for the next move
    setStartY(e.clientY);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <motion.div
        className="w-16 h-16 rounded-full cursor-pointer relative shadow-lg"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{ 
          rotate: rotation,
          backgroundColor: "#1a1a1a", // Fixed dark color
          touchAction: "none"
        }}
      >
        <div className="absolute top-2 left-1/2 w-1 h-4 bg-white -translate-x-1/2 rounded-full" />
      </motion.div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}