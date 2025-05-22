"use client";

import { Suspense } from 'react';

// Define a loading component for the Suspense fallback for the admin section
const AdminSectionLoading = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    <p className="ml-4 text-lg text-gray-700">Cargando panel de administración...</p>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminSectionLoading />}>
      {children}
    </Suspense>
  );
}
