import React from 'react';

export default function LegalHeader({ title }: { title: string }) {
  return (
    <div className="bg-gray-100 mb-10 sticky top-16 z-10 shadow-md">
      <div className="container mx-auto px-6 py-4">
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
      </div>
    </div>
  );
}
