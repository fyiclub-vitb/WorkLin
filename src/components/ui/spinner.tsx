import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = "md", 
  color = "currentColor", 
  className 
}) => {
  
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
        className={cn(
          "rounded-full border-t-transparent",
          sizeClasses[size],
          className
        )}
        style={{ borderColor: color === "currentColor" ? undefined : color, borderTopColor: "transparent" }}
      />
    </div>
  );
};

export default Spinner;