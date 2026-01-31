import React from 'react';

interface TouchCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const TouchCard: React.FC<TouchCardProps> = ({ children, onClick }) => (
  <div
    className="rounded-lg shadow p-4 bg-white dark:bg-gray-800 active:scale-95 transition-transform duration-100 cursor-pointer select-none"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyPress={e => { if (e.key === 'Enter' && onClick) onClick(); }}
  >
    {children}
  </div>
);

export default TouchCard;
