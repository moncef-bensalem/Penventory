'use client';

import { useAuth } from '@/context/auth-context';
import DashboardCharts from '@/components/backoffice/DashboardCharts';
import Heading from '@/components/backoffice/Heading';
import LargeCards from '@/components/backoffice/LargeCards';
import SmallCards from '@/components/backoffice/SmallCards';
import RecentOrdersDataTable from '@/components/backoffice/RecentOrdersDataTable';
import React from 'react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-4">
      <Heading title="Dashboard Overview" />
      {/* Large Cards */}
      <LargeCards />
      {/* Small Cards */}
      <SmallCards />
      {/* Charts */}
      <DashboardCharts />
      {/* Recent Orders Table */}
      <div className="mt-8 px-4">
        <RecentOrdersDataTable />
      </div>
     
    </div>
  );
}
