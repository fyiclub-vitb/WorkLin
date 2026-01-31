import React from 'react';

const MobileSidebar: React.FC = () => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-40 md:hidden">
    {/* Sidebar content for mobile */}
    <div className="p-4">Sidebar</div>
  </aside>
);

export default MobileSidebar;
