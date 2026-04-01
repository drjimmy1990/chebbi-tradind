'use client';

import dynamic from 'next/dynamic';

const AdminGate = dynamic(
  () => import('@/components/chebbi/admin-gate').then((mod) => ({ default: mod.AdminGate })),
  { ssr: false },
);

const DashboardPage = dynamic(
  () => import('@/components/chebbi/dashboard-page').then((mod) => ({ default: mod.DashboardPage })),
  { ssr: false },
);

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminGate>
        <DashboardPage />
      </AdminGate>
    </div>
  );
}
