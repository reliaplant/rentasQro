import React from 'react';

export default function LegalHeader({ title }: { title: string }) {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
      </div>
    </div>
  );
}
