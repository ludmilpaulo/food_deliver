"use client";
import { FC } from 'react';

interface SidebarProps {
  setActiveComponent: (component: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ setActiveComponent }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <nav className="mt-8">
          <ul>
            <li className="mb-4">
              <span className="text-lg cursor-pointer" onClick={() => setActiveComponent('users')}>Users</span>
            </li>
            <li className="mb-4">
              <span className="text-lg cursor-pointer" onClick={() => setActiveComponent('site-info')}>Site Information</span>
            </li>
            <li className="mb-4">
              <span className="text-lg cursor-pointer" onClick={() => setActiveComponent('orders')}>Orders</span>
            </li>
            <li className="mb-4">
              <span className="text-lg cursor-pointer" onClick={() => setActiveComponent('restaurants')}>Restaurants</span>
            </li>
            <li className="mb-4">
              <span className="text-lg cursor-pointer" onClick={() => setActiveComponent('careers')}>Careers</span>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
