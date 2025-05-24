'use client';

import { Suspense } from 'react';

export default function AccountClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
        <p>Chargement de votre compte...</p>
      </div>
    </Suspense>
  );
}
