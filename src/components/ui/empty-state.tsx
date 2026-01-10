import { motion } from "framer-motion";
import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaText: string;
  onClick: () => void;
  illustration?: React.ReactNode;
}

/**
 * Reusable EmptyState component
 * Can be used for:
 * - No Pages
 * - No Blocks
 * - No Search Results
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  ctaText,
  onClick,
  illustration,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      {illustration && (
        <motion.div
          animate={{ y: [0, -10, 0] }}       // subtle up-down animation
          transition={{ duration: 2, repeat: Infinity }}
          className="w-64 h-64"
        >
          {illustration}
        </motion.div>
      )}
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-500">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {ctaText}
      </button>
    </div>
  );
};

/**
 * Placeholder illustrations (can replace with SVGs or Lottie)
 */
export const Illustrations = {
  NoPages: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      stroke="currentColor"
      className="w-full h-full text-gray-300"
    >
      <rect x="8" y="12" width="48" height="40" rx="2" strokeWidth="2" />
      <line x1="16" y1="20" x2="48" y2="20" strokeWidth="2" />
      <line x1="16" y1="28" x2="48" y2="28" strokeWidth="2" />
      <line x1="16" y1="36" x2="48" y2="36" strokeWidth="2" />
    </svg>
  ),
  NoBlocks: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      stroke="currentColor"
      className="w-full h-full text-gray-300"
    >
      <circle cx="32" cy="32" r="16" strokeWidth="2" />
      <line x1="32" y1="24" x2="32" y2="40" strokeWidth="2" />
      <line x1="24" y1="32" x2="40" y2="32" strokeWidth="2" />
    </svg>
  ),
  NoResults: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      stroke="currentColor"
      className="w-full h-full text-gray-300"
    >
      <circle cx="27" cy="27" r="12" strokeWidth="2" />
      <line x1="41" y1="41" x2="56" y2="56" strokeWidth="2" />
    </svg>
  ),
};
