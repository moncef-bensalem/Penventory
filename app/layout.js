'use client';

import './globals.css';
import { Inter } from "next/font/google";
import { ThemeProvider } from '../providers/theme-provider';
import { AuthProvider } from '../context/auth-context';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Penventory - Gestion de stock</title>
        <meta name="description" content="Application de gestion de stock" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
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
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: 'green',
                  },
                },
                error: {
                  style: {
                    background: 'red',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: 'red',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}