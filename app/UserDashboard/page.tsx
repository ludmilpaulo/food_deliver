"use client";
import React, { useState } from 'react';
import DownloadInvoice from './DownloadInvoice';
import OrderHistory from './OrderHistory';
import TrackOrders from './TrackOrders';
import UpdateProfile from './UpdateProfile';
import Sidebar from './Sidebar';  // Importing your custom Sidebar component

const Dashboard: React.FC = () => {
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
      <div className="flex-grow p-4">{renderComponent()}</div>
    </div>
  );
};

export default Dashboard;
