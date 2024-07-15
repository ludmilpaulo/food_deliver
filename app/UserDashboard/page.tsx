"use client";
import React, { useState, useEffect } from 'react';
import DownloadInvoice from './DownloadInvoice';
import OrderHistory from './OrderHistory';
//import TrackOrders from './TrackOrders';
import UpdateProfile from './UpdateProfile';
import Sidebar from './Sidebar';  // Importing your custom Sidebar component
import dynamic from 'next/dynamic';

const TrackOrders = dynamic(() => import('./TrackOrders'), { ssr: false });

const UserDashboard: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>('trackOrders');

  const renderComponent = () => {
    switch (selectedMenu) {
      case 'trackOrders':
        return <TrackOrders />;
      case 'updateProfile':
        return <UpdateProfile />;
      case 'orderHistory':
        return <OrderHistory />;
      case 'downloadInvoice':
        return <DownloadInvoice />;
      default:
        return <TrackOrders />;
    }
  };

  return (
    <div className="flex">
      <Sidebar setSelectedMenu={setSelectedMenu} />
      <div className="flex-grow p-4 bg-gradient-to-r from-yellow-400 to-blue-600">
        {renderComponent()}
      </div>
    </div>
  );
};

export default UserDashboard;
