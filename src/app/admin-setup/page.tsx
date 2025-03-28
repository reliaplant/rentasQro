"use client";

import AdminSetup from '../utils/adminSetup';

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup Page</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use this page to create the first admin account in the system
          </p>
        </div>

        <AdminSetup />
      </div>
    </div>
  );
}
