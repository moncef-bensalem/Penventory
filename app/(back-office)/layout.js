'use client';

import Sidebar from '../../components/backoffice/Sidebar';
import { Header } from '../../components/backoffice/Header';
import { useAuth } from '../../context/auth-context';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function BackOfficeLayout({ children }) {
  const { user, loading } = useAuth();
  const [showSideBar, setShowSideBar] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Rediriger vers la page de login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fermer le sidebar quand on change de page sur mobile
  useEffect(() => {
    if (showSideBar) {
      setShowSideBar(false);
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // L'useEffect s'occupera de la redirection
  }

  return (
    <div className="h-full relative">
      {/* Sidebar desktop */}
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
      </div>

      {/* Contenu principal */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
        <main className="flex-1 p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>
      </div>

      {/* Sidebar mobile avec overlay */}
      <div 
        className="md:hidden fixed inset-0 z-[90] bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" 
        style={{ opacity: showSideBar ? 1 : 0, pointerEvents: showSideBar ? 'auto' : 'none' }}
        onClick={() => setShowSideBar(false)}
      >
        <div className="absolute inset-y-0 left-0" onClick={e => e.stopPropagation()}>
          <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
        </div>
      </div>

      {/* Notifications toast */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: 'green',
            },
          },
          error: {
            style: {
              background: 'red',
            },
          },
        }}
      />
    </div>
  );
}