'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

const AuthContext = createContext({
  user: null,
  store: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
          setStore(session.user.store);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Récupérer les informations de l'utilisateur
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
          setStore(session.user.store);
          
          toast.success('Connexion réussie');
          
          // Rediriger vers le tableau de bord en fonction du rôle
          switch (session.user.role) {
            case 'ADMIN':
              router.push('/dashboard');
              break;
            case 'MANAGER':
              router.push('/manager/dashboard');
              break;
            case 'SELLER':
              router.push('/seller/dashboard');
              break;
            case 'CUSTOMER':
              router.push('/');
              break;
            default:
              router.push('/');
              break;
          }
          
          router.refresh();
          return;
        }
      }
      
      // Si on arrive ici, c'est qu'on n'a pas pu obtenir les infos de l'utilisateur
      toast.success('Connexion réussie');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      setStore(null);
      router.push('/');
      router.refresh();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <AuthContext.Provider value={{ user, store, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
