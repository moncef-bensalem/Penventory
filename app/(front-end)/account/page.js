// This file is a server component that doesn't use any client hooks

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'only-no-store';
export const revalidate = 0;

// Simple placeholder component
export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Chargement de votre compte...</h1>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
    </div>
  );
}
