'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Upload,
  Save,
  Moon,
  Sun,
  Clock,
  Languages,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    pushNotifications: true,
    notificationFrequency: 'immediate'
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    activeSessions: [],
    loginHistory: []
  });
  const [paymentSettings, setPaymentSettings] = useState({
    defaultPaymentMethod: 'card',
    bankName: '',
    accountNumber: '',
    iban: '',
    swift: '',
    preferredCurrency: 'TND'
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Récupérer les données utilisateur et les paramètres
  useEffect(() => {
    if (user) {
      console.log('User detected, fetching settings data...');
      fetchSettingsData();
    } else if (!authLoading) {
      // Si l'utilisateur n'est pas authentifié et que l'authentification est terminée
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user settings...');
      
      // Création de données par défaut en fonction de l'utilisateur connecté
      const defaultProfileData = {
        name: user?.name || 'Administrateur',
        email: user?.email || 'admin@penventory.com',
        phone: user?.phone || '+33 6 12 34 56 78',
        image: user?.image || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      
      // Utiliser les données du contexte d'authentification
      setProfileData(defaultProfileData);
      
      if (user?.image) {
        setImagePreview(user.image);
      }
      
      // Définir des préférences d'affichage par défaut
      setDisplayPreferences({
        theme: 'light',
        language: 'fr',
        timezone: 'Europe/Paris'
      });
      
      // Définir des paramètres de notification par défaut
      setNotificationSettings({
        emailNotifications: true,
        orderUpdates: true,
        marketingEmails: false,
        securityAlerts: true,
        pushNotifications: true,
        notificationFrequency: 'immediate'
      });
      
      // Définir des paramètres de sécurité par défaut
      setSecuritySettings({
        twoFactorEnabled: false,
        activeSessions: [
          {
            id: 'session-1',
            device: 'Chrome sur Windows',
            location: 'Tunis, Tunisie',
            lastActive: new Date().toISOString(),
            current: true
          }
        ],
        loginHistory: [
          {
            id: 'login-1',
            date: new Date().toISOString(),
            device: 'Chrome sur Windows',
            location: 'Tunis, Tunisie',
            status: 'success'
          }
        ]
      });
      
      // Définir des paramètres de paiement par défaut
      setPaymentSettings({
        defaultPaymentMethod: 'card',
        bankName: '',
        accountNumber: '',
        iban: '',
        swift: '',
        preferredCurrency: 'TND'
      });
      
      // Simuler un délai pour donner l'impression de chargement des données
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching settings data:', error);
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  // Gestion des changements dans le formulaire de profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion du téléchargement de l'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Dans un environnement réel, vous téléchargeriez le fichier sur un serveur
    // et mettriez à jour l'URL de l'image dans le profil
    toast.success('Image téléchargée avec succès');
  };

  // Enregistrer les modifications du profil
  const saveProfileChanges = async (e) => {
    e.preventDefault();
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          image: imagePreview,
          ...(profileData.oldPassword && profileData.newPassword ? {
            oldPassword: profileData.oldPassword,
            newPassword: profileData.newPassword
          } : {})
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
      }
      
      toast.success('Profil mis à jour avec succès');
      
      // Réinitialiser les champs de mot de passe
      setProfileData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  // Enregistrer les préférences d'affichage
  const saveDisplayPreferences = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(displayPreferences),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour des préférences');
      }
      
      toast.success('Préférences mises à jour avec succès');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des préférences');
    } finally {
      setLoading(false);
    }
  };

  // Enregistrer les paramètres de notification
  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour des notifications');
      }
      
      toast.success('Paramètres de notification mis à jour avec succès');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des notifications');
    } finally {
      setLoading(false);
    }
  };

  // Activer/désactiver l'authentification à deux facteurs
  const toggleTwoFactor = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/security/two-factor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !securitySettings.twoFactorEnabled
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'authentification à deux facteurs');
      }
      
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
      
      toast.success(`Authentification à deux facteurs ${!securitySettings.twoFactorEnabled ? 'activée' : 'désactivée'} avec succès`);
    } catch (error) {
      console.error('Error toggling two-factor authentication:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'authentification à deux facteurs');
    } finally {
      setLoading(false);
    }
  };

  // Terminer une session active
  const terminateSession = async (sessionId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/user/security/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la fermeture de la session');
      }
      
      setSecuritySettings(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.id !== sessionId)
      }));
      
      toast.success('Session terminée avec succès');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error(error.message || 'Erreur lors de la fermeture de la session');
    } finally {
      setLoading(false);
    }
  };

  // Enregistrer les paramètres de paiement
  const savePaymentSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentSettings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour des paramètres de paiement');
      }
      
      toast.success('Paramètres de paiement mis à jour avec succès');
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des paramètres de paiement');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshData = () => {
    fetchSettingsData();
    toast.success('Données actualisées');
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHead
        title="Paramètres du compte"
        description="Gérez vos informations personnelles, préférences et paramètres de sécurité"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </PageHead>

      <div className="max-w-6xl mx-auto mt-6">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center">
              <Sun className="h-4 w-4 mr-2" />
              Affichage
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Paiement
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 flex flex-col items-center space-y-4">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-orange-200">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Photo de profil"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="profile-image"
                      className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Changer la photo
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {isUploading && (
                    <div className="text-sm text-gray-500">Téléchargement en cours...</div>
                  )}
                </div>

                <form onSubmit={saveProfileChanges} className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Nom complet
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Votre nom complet"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Adresse e-mail
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="votre.email@example.com"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Numéro de téléphone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="+33 6 12 34 56 78"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Changer le mot de passe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                      <Input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        value={profileData.oldPassword}
                        onChange={handleProfileChange}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={profileData.newPassword}
                        onChange={handleProfileChange}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={handleProfileChange}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Affichage */}
          <TabsContent value="display" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Préférences d'affichage</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-5 w-5" />
                    <Label htmlFor="theme" className="text-base">Thème</Label>
                  </div>
                  <Select
                    value={displayPreferences.theme}
                    onValueChange={(value) => setDisplayPreferences(prev => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Languages className="h-5 w-5" />
                    <Label htmlFor="language" className="text-base">Langue</Label>
                  </div>
                  <Select
                    value={displayPreferences.language}
                    onValueChange={(value) => setDisplayPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <Label htmlFor="timezone" className="text-base">Fuseau horaire</Label>
                  </div>
                  <Select
                    value={displayPreferences.timezone}
                    onValueChange={(value) => setDisplayPreferences(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={saveDisplayPreferences}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les préférences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Préférences de notification</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <Label htmlFor="emailNotifications" className="text-base">Notifications par e-mail</Label>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-4 pl-8">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderUpdates" className="text-sm">Mises à jour des commandes</Label>
                    <Switch
                      id="orderUpdates"
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderUpdates: checked }))}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails" className="text-sm">Emails marketing et promotions</Label>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityAlerts" className="text-sm">Alertes de sécurité</Label>
                    <Switch
                      id="securityAlerts"
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <Label htmlFor="pushNotifications" className="text-base">Notifications push</Label>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <Label htmlFor="notificationFrequency" className="text-base">Fréquence des notifications</Label>
                  </div>
                  <Select
                    value={notificationSettings.notificationFrequency}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, notificationFrequency: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner une fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiate</SelectItem>
                      <SelectItem value="daily">Résumé quotidien</SelectItem>
                      <SelectItem value="weekly">Résumé hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={saveNotificationSettings}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les préférences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Sécurité du compte</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Authentification à deux facteurs
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="twoFactorEnabled"
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={toggleTwoFactor}
                      disabled={loading}
                    />
                    <span className="text-sm font-medium">
                      {securitySettings.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-base font-medium mb-4">Sessions actives</h4>
                  <div className="space-y-4">
                    {securitySettings.activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <span className="mr-3">{session.location}</span>
                            <span>IP: {session.ip}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Dernière activité: {formatDate(session.lastActive)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {session.current && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-3">
                              Session actuelle
                            </span>
                          )}
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => terminateSession(session.id)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-600"
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Déconnecter
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-base font-medium mb-4">Historique des connexions</h4>
                  <div className="space-y-3">
                    {securitySettings.loginHistory.map((login) => (
                      <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{login.device}</p>
                            {login.status === 'SUCCESS' ? (
                              <span className="ml-2 text-green-500">
                                <CheckCircle className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="ml-2 text-red-500">
                                <XCircle className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <span className="mr-3">{login.location}</span>
                            <span>IP: {login.ip}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">
                            {formatDate(login.date)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                            login.status === 'SUCCESS' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {login.status === 'SUCCESS' ? 'Réussie' : 'Échouée'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Paiement */}
          <TabsContent value="payment" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Paramètres de paiement</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-4">Méthode de paiement par défaut</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={paymentSettings.defaultPaymentMethod === 'card'}
                        onChange={() => setPaymentSettings(prev => ({ ...prev, defaultPaymentMethod: 'card' }))}
                        className="h-4 w-4 text-orange-500"
                      />
                      <Label htmlFor="card" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Carte bancaire
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentSettings.defaultPaymentMethod === 'paypal'}
                        onChange={() => setPaymentSettings(prev => ({ ...prev, defaultPaymentMethod: 'paypal' }))}
                        className="h-4 w-4 text-orange-500"
                      />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bank"
                        name="paymentMethod"
                        value="bank"
                        checked={paymentSettings.defaultPaymentMethod === 'bank'}
                        onChange={() => setPaymentSettings(prev => ({ ...prev, defaultPaymentMethod: 'bank' }))}
                        className="h-4 w-4 text-orange-500"
                      />
                      <Label htmlFor="bank">Virement bancaire</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-base font-medium mb-4">Informations bancaires pour les retraits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Nom de la banque</Label>
                      <Input
                        id="bankName"
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankName: e.target.value }))}
                        placeholder="Nom de votre banque"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Numéro de compte</Label>
                      <Input
                        id="accountNumber"
                        value={paymentSettings.accountNumber}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="XXXX XXXX XXXX XXXX"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={paymentSettings.iban}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, iban: e.target.value }))}
                        placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swift">Code SWIFT/BIC</Label>
                      <Input
                        id="swift"
                        value={paymentSettings.swift}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, swift: e.target.value }))}
                        placeholder="XXXXXXXX"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-base font-medium mb-4">Devise préférée</h4>
                  <Select
                    value={paymentSettings.preferredCurrency}
                    onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, preferredCurrency: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TND">Dinar tunisien (TND)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar américain ($)</SelectItem>
                      <SelectItem value="GBP">Livre sterling (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={savePaymentSettings}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les paramètres
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
