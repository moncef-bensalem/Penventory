'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/backoffice/PageHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, User, Bell, Shield, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManagerSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // État pour les paramètres du profil
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    password: '',
    confirmPassword: '',
  });

  // État pour les paramètres de l'application
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    appNotifications: true,
    smsNotifications: false,
    language: 'fr',
    currency: 'TND',
  });

  // État pour les paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    ipRestriction: false,
    dataRetention: '90',
  });

  // Charger les paramètres initiaux
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/users/settings');
        if (!response.ok) throw new Error('Erreur lors du chargement des paramètres');
        
        const data = await response.json();
        
        // Mettre à jour les états avec les données reçues
        setProfileSettings({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.image || '',
          password: '',
          confirmPassword: '',
        });
        
        setAppSettings({
          darkMode: data.preferences?.darkMode ?? true,
          emailNotifications: data.preferences?.emailNotifications ?? true,
          appNotifications: data.preferences?.appNotifications ?? true,
          smsNotifications: data.preferences?.smsNotifications ?? false,
          language: data.preferences?.language || 'fr',
          currency: data.preferences?.currency || 'TND',
        });
        
        setSecuritySettings({
          twoFactorAuth: data.preferences?.twoFactorAuth ?? false,
          sessionTimeout: data.preferences?.sessionTimeout || '30',
          ipRestriction: data.preferences?.ipRestriction ?? false,
          dataRetention: data.preferences?.dataRetention || '90',
        });
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Impossible de charger vos paramètres');
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Mettre à jour les données du formulaire de profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings({
      ...profileSettings,
      [name]: value,
    });
  };

  // Mettre à jour les données du formulaire des paramètres d'application
  const handleAppSettingChange = (key, value) => {
    setAppSettings({
      ...appSettings,
      [key]: value,
    });
  };

  // Mettre à jour les données du formulaire des paramètres de sécurité
  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value,
    });
  };

  // Soumettre les modifications du profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (profileSettings.password !== profileSettings.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileSettings.name,
          email: profileSettings.email,
          phone: profileSettings.phone,
          password: profileSettings.password || undefined,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
      
      const data = await response.json();
      toast.success('Profil mis à jour avec succès');
      
      // Réinitialiser les champs de mot de passe
      setProfileSettings(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre les modifications des paramètres d'application
  const handleAppSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...securitySettings, // Garder les paramètres de sécurité existants
            ...appSettings // Ajouter/mettre à jour les paramètres d'application
          }
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des paramètres');
      
      await response.json();
      toast.success('Paramètres d\'application mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast.error('Impossible de mettre à jour les paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre les modifications des paramètres de sécurité
  const handleSecuritySettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...appSettings, // Garder les paramètres d'application existants
            ...securitySettings // Ajouter/mettre à jour les paramètres de sécurité
          }
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des paramètres de sécurité');
      
      await response.json();
      toast.success('Paramètres de sécurité mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de sécurité:', error);
      toast.error('Impossible de mettre à jour les paramètres de sécurité');
    } finally {
      setLoading(false);
    }
  };

  // Exporter les données utilisateur
  const handleExportData = () => {
    toast.success('Exportation des données démarrée');
    // TODO: Implémenter l'exportation des données utilisateur
  };

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
    
    if (confirmed) {
      setLoading(true);
      try {
        const response = await fetch('/api/users/settings', {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression du compte');
        
        await response.json();
        toast.success('Compte supprimé avec succès');
        
        // Déconnecter l'utilisateur et rediriger vers la page d'accueil
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        toast.error('Impossible de supprimer le compte');
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux managers.
            Veuillez vous connecter avec un compte manager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead 
        title="Paramètres" 
        description="Gérez vos préférences et paramètres du tableau de bord" 
      />

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="application" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Application
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et votre mot de passe
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Votre nom" 
                      value={profileSettings.name} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="votre.email@example.com" 
                      value={profileSettings.email} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      placeholder="+216 XX XXX XXX" 
                      value={profileSettings.phone} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Photo de profil</Label>
                    <Input 
                      id="avatar" 
                      name="avatar" 
                      type="file" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <Separator className="my-4" />
                
                <h3 className="text-lg font-medium">Changer de mot de passe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={profileSettings.password} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={profileSettings.confirmPassword} 
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setProfileSettings({
                  name: '',
                  email: '',
                  phone: '',
                  avatar: '',
                  password: '',
                  confirmPassword: '',
                })}>
                  Réinitialiser
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Onglet Application */}
        <TabsContent value="application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'application</CardTitle>
              <CardDescription>
                Personnalisez votre expérience et vos préférences de notification
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAppSettingsSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thème et affichage</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="darkMode" className="text-base">Mode sombre</Label>
                      <p className="text-sm text-gray-500">Activer le mode sombre pour l'interface</p>
                    </div>
                    <Switch 
                      id="darkMode" 
                      checked={appSettings.darkMode}
                      onCheckedChange={(checked) => handleAppSettingChange('darkMode', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-base">Notifications par email</Label>
                      <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={appSettings.emailNotifications}
                      onCheckedChange={(checked) => handleAppSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appNotifications" className="text-base">Notifications dans l'application</Label>
                      <p className="text-sm text-gray-500">Recevoir des notifications dans l'application</p>
                    </div>
                    <Switch 
                      id="appNotifications" 
                      checked={appSettings.appNotifications}
                      onCheckedChange={(checked) => handleAppSettingChange('appNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="text-base">Notifications par SMS</Label>
                      <p className="text-sm text-gray-500">Recevoir des notifications par SMS</p>
                    </div>
                    <Switch 
                      id="smsNotifications" 
                      checked={appSettings.smsNotifications}
                      onCheckedChange={(checked) => handleAppSettingChange('smsNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Préférences régionales</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <select 
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={appSettings.language}
                      onChange={(e) => handleAppSettingChange('language', e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <select 
                      id="currency"
                      className="w-full p-2 border rounded-md"
                      value={appSettings.currency}
                      onChange={(e) => handleAppSettingChange('currency', e.target.value)}
                    >
                      <option value="TND">Dinar Tunisien (TND)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar américain (USD)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="ml-auto bg-orange-500 hover:bg-orange-600">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les préférences
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Protégez votre compte et gérez les options de sécurité
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSecuritySettingsSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth" className="text-base">Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">Renforce la sécurité de votre compte</p>
                    </div>
                    <Switch 
                      id="twoFactorAuth" 
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Durée de session (minutes)</Label>
                    <select 
                      id="sessionTimeout"
                      className="w-full p-2 border rounded-md"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingChange('sessionTimeout', e.target.value)}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                      <option value="240">4 heures</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Accès et données</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ipRestriction" className="text-base">Restriction d'adresse IP</Label>
                      <p className="text-sm text-gray-500">Limite l'accès à partir d'adresses IP spécifiques</p>
                    </div>
                    <Switch 
                      id="ipRestriction" 
                      checked={securitySettings.ipRestriction}
                      onCheckedChange={(checked) => handleSecuritySettingChange('ipRestriction', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Conservation des données (jours)</Label>
                    <select 
                      id="dataRetention"
                      className="w-full p-2 border rounded-md"
                      value={securitySettings.dataRetention}
                      onChange={(e) => handleSecuritySettingChange('dataRetention', e.target.value)}
                    >
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours</option>
                      <option value="180">180 jours</option>
                      <option value="365">1 an</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Actions de compte</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium">Exporter vos données</p>
                      <p className="text-sm text-gray-500">Télécharger toutes vos données personnelles</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleExportData}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium text-red-600">Supprimer votre compte</p>
                      <p className="text-sm text-gray-500">Cette action est définitive et irréversible</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="ml-auto bg-orange-500 hover:bg-orange-600">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les paramètres
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 