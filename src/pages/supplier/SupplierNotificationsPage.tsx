import React from 'react';
import { SupplierNotificationDashboard } from '@/components/notifications/SupplierNotificationDashboard';
import SupplierLayout from '@/components/layout/SupplierLayout';

const SupplierNotificationsPage: React.FC = () => {
  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SupplierNotificationDashboard />
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierNotificationsPage;
