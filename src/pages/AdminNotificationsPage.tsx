import React from 'react';
import { AdminDashboard } from '@/components/admin';

const AdminNotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
