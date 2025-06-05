"use client";
import Sidebar from './Sidebar';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Users = dynamic(() => import('./user/Users'));
const SiteInfo = dynamic(() => import('./info/SiteInfo'));
const Orders = dynamic(() => import('./order/Orders'));
const Stores = dynamic(() => import('./store/Stores'));
const Careers = dynamic(() => import('./carrer/Careers'));

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('users');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'site-info':
        return <SiteInfo />;
      case 'orders':
        return <Orders />;
      case 'stores':
        return <Stores />;
      case 'careers':
        return <Careers />;
      default:
        return <Users />;
    }
  };

  return (
    <div className="flex">
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="flex-grow p-8">
        {renderComponent()}
      </div>
    </div>
  );
};

export default Dashboard;
