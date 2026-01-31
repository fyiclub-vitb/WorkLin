import React from 'react';

const MobileNavbar: React.FC = () => (
  <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 shadow z-50 flex items-center px-4 md:hidden">
    {/* Navbar content for mobile */}
    <span className="font-bold text-lg">WorkLin</span>
  </nav>
);

export default MobileNavbar;
