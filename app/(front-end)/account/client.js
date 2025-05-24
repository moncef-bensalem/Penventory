'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the account content component with no SSR
const AccountContentNoSSR = dynamic(() => import('./AccountContent'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  )
});

export default function AccountClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <AccountContentNoSSR />
    </Suspense>
  );
}
