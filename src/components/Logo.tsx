import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  showText = true,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="relative rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          {/* W Letter Design */}
          <path
            d="M3 3L7 17L11 7L15 17L19 3"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M3 21L7 17L11 21L15 17L19 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className="font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-lg sm:text-xl md:text-2xl">
          WorkLin
        </span>
      )}
    </div>
  );
};

// Icon-only version for favicon and small uses
export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 32,
  className = '' 
}) => {
  return (
    <div 
      className={`rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L7 17L11 7L15 17L19 3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M3 21L7 17L11 21L15 17L19 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
