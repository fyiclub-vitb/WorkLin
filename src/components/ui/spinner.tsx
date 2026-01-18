import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Props for the Spinner component
 */
interface SpinnerProps {
  size?: "sm" | "md" | "lg"; // Size of the spinner (small, medium, or large)
  color?: string; // Color of the spinner border (defaults to current text color)
  className?: string; // Additional CSS classes to apply
}

/**
 * Spinner Component
 * 
 * A loading spinner that continuously rotates to indicate something is loading.
 * This is shown when waiting for:
 * - Data to load from the database
 * - API calls to complete
 * - AI responses to generate
 * - Files to upload
 * 
 * Uses Framer Motion for smooth, hardware-accelerated rotation.
 * The spinner is just a circular border with the top portion transparent,
 * which creates the "loading" effect when rotated.
 */
const Spinner: React.FC<SpinnerProps> = ({ 
  size = "md", // Default to medium size if not specified
  color = "currentColor", // Default to inheriting text color
  className 
}) => {
  
  // Map size prop to actual CSS classes
  // Each size has specific width, height, and border thickness
  const sizeClasses = {
    sm: "w-4 h-4 border-2",   // Small: 16x16px with 2px border
    md: "w-8 h-8 border-4",   // Medium: 32x32px with 4px border
    lg: "w-12 h-12 border-4", // Large: 48x48px with 4px border
  };

  return (
    // Wrapper div centers the spinner
    <div className={cn("flex justify-center items-center", className)}>
      {/* The actual spinning element */}
      <motion.div
        // Framer Motion animation config
        animate={{ rotate: 360 }} // Rotate from 0 to 360 degrees
        transition={{
          repeat: Infinity, // Keep spinning forever
          duration: 1, // One full rotation takes 1 second
          ease: "linear", // Constant speed (no acceleration/deceleration)
        }}
        className={cn(
          "rounded-full border-t-transparent", // Circular shape with transparent top
          sizeClasses[size], // Apply size-specific classes
          className // Allow custom classes
        )}
        // Set border color
        // If color is "currentColor", let CSS inheritance handle it
        // Otherwise, explicitly set the border color
        style={{ 
          borderColor: color === "currentColor" ? undefined : color, 
          borderTopColor: "transparent" // Top border is always transparent
        }}
      />
    </div>
  );
};

export default Spinner;