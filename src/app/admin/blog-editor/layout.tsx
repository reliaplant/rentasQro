"use client";

import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

export default function BlogEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Link
            href="/admin?tab=blog"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Volver al panel
          </Link>
        </div>
        <Suspense>
          <main>{children}</main>
        </Suspense>
      </div>
    </div>
  );
}
