import React from 'react';

const BottomNavigation: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-inner flex justify-around items-center md:hidden">
    {/* Example nav buttons */}
    <button className="flex flex-col items-center text-xs focus:outline-none">
      <span className="material-icons">home</span>
      Home
    </button>
    <button className="flex flex-col items-center text-xs focus:outline-none">
      <span className="material-icons">search</span>
      Search
    </button>
    <button className="flex flex-col items-center text-xs focus:outline-none">
      <span className="material-icons">settings</span>
      Settings
    </button>
  </nav>
);

export default BottomNavigation;
