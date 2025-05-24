'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { User, Lock, Shield } from 'lucide-react';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Charger les données du profil au chargement de la page
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || '',
        email: user.email || '',
      }));
      
      if (user.image) {
        setProfileImage(user.image);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          image: profileImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
      }

      const data = await response.json();
      
      // Mettre à jour le formulaire avec les nouvelles données
      setFormData(prevData => ({
        ...prevData,
        name: data.name || prevData.name,
        email: data.email || prevData.email,
      }));
      
      // Mettre à jour l'image du profil si elle a été modifiée
      if (data.image) {
        setProfileImage(data.image);
        
        // Mettre à jour l'utilisateur dans le contexte de session
        if (user) {
          const updatedUser = {
            ...user,
            name: data.name || user.name,
            image: data.image
          };
          setUser(updatedUser);
        }
      }
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Vérifier que les mots de passe correspondent
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du mot de passe');
      }

      // Réinitialiser les champs de mot de passe
      setFormData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Profil Administrateur
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations de profil */}
        <Card className="p-6 col-span-1">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={profileImage || user.image} alt={user.name} />
                <AvatarFallback className="bg-orange-100 text-orange-800 text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute bottom-0 right-0 rounded-full p-2" 
                onClick={triggerFileInput}
              >
                <User className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Administrateur
            </span>
          </div>
        </Card>
        
        {/* Formulaire de mise à jour du profil */}
        <Card className="p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-orange-500" />
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom complet
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-800"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                L'email ne peut pas être modifié
              </p>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </Button>
          </form>
        </Card>
        
        {/* Sécurité */}
        <Card className="p-6 col-span-1 lg:col-span-3">
          <div className="flex items-center mb-4">
            <Lock className="w-5 h-5 mr-2 text-orange-500" />
            <h2 className="text-xl font-semibold">Sécurité</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe actuel
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nouveau mot de passe
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>
        </Card>
        
        {/* Paramètres avancés */}
        <Card className="p-6 col-span-1 lg:col-span-3">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 mr-2 text-orange-500" />
            <h2 className="text-xl font-semibold">Paramètres avancés</h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de la plateforme PENVENTORY. 
            Vous pouvez gérer les vendeurs, les produits, les commandes et les paramètres du système.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/customers'}>
              Gestion des utilisateurs
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/stores'}>
              Gestion des boutiques
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/catalogue/products'}>
              Gestion des produits
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/orders'}>
              Gestion des commandes
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/settings'}>
              Paramètres du système
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
