'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/auth-context';
import { Upload, Store, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SellerStore() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [hasStore, setHasStore] = useState(false);
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    openingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '13:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    }
  });

  // Récupérer les données de la boutique au chargement
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch('/api/seller/store');
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setHasStore(true);
            setStoreData({
              name: data.name || '',
              description: data.description || '',
              address: data.address || '',
              city: data.city || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              facebook: data.facebook || '',
              instagram: data.instagram || '',
              openingHours: processOpeningHours(data.openingHours)
            });
            
            if (data.logo) setLogo(data.logo);
            if (data.banner) setBanner(data.banner);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données de la boutique:', error);
      }
    };
    
    fetchStoreData();
  }, []);
  
  // Fonction pour traiter les horaires d'ouverture depuis l'API
  const processOpeningHours = (hours) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      return {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
      };
    }
    
    const processedHours = {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '13:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    };
    
    hours.forEach(hour => {
      if (hour.day && processedHours[hour.day.toLowerCase()]) {
        processedHours[hour.day.toLowerCase()] = {
          open: hour.openTime || '',
          close: hour.closeTime || '',
          closed: hour.isClosed || false
        };
      }
    });
    
    return processedHours;
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogo(e.target.result);
        } else {
          setBanner(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);

    try {
      // Déterminer si c'est une création ou une mise à jour
      const endpoint = hasStore ? '/api/seller/store' : '/api/seller/store/create';
      const method = hasStore ? 'PUT' : 'POST';
      
      console.log(`Envoi des données vers ${endpoint} avec la méthode ${method}`);
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storeData,
          logo,
          banner,
        }),
      });

      // Vérifier si la réponse est OK
      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du serveur
        let errorMessage = hasStore 
          ? 'Erreur lors de la mise à jour de la boutique' 
          : 'Erreur lors de la création de la boutique';
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = typeof errorData.error === 'string' 
              ? errorData.error 
              : errorData.error.message || errorMessage;
          }
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse:', e);
        }
        throw new Error(errorMessage);
      }

      // Récupérer les données de la boutique mise à jour
      const updatedStore = await response.json();
      
      // Mettre à jour l'état local
      if (updatedStore && updatedStore.id) {
        setHasStore(true);
        toast.success(hasStore ? 'Boutique mise à jour avec succès' : 'Boutique créée avec succès');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {hasStore ? 'Ma Boutique' : 'Créer ma Boutique'}
        </h2>
        <p className="text-muted-foreground">
          {hasStore 
            ? 'Personnalisez votre boutique et gérez vos informations' 
            : 'Configurez votre boutique pour commencer à vendre vos produits'}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de la boutique
                  </label>
                  <Input
                    required
                    value={storeData.name}
                    onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                    placeholder="Ma super boutique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email professionnel
                  </label>
                  <Input
                    type="email"
                    value={storeData.email}
                    onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                    placeholder="contact@maboutique.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <Input
                    value={storeData.phone}
                    onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Site web
                  </label>
                  <Input
                    type="url"
                    value={storeData.website}
                    onChange={(e) => setStoreData({ ...storeData, website: e.target.value })}
                    placeholder="https://www.maboutique.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Adresse
                  </label>
                  <Input
                    value={storeData.address}
                    onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                    placeholder="Adresse de la boutique"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={storeData.description}
                    onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                    placeholder="Description de votre boutique"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading 
                    ? 'Enregistrement...' 
                    : hasStore 
                      ? 'Enregistrer les modifications' 
                      : 'Créer ma boutique'}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo de la boutique
                </label>
                <div className="flex items-center gap-4">
                  {logo && (
                    <div className="relative w-24 h-24">
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setLogo(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bannière de la boutique
                </label>
                <div className="flex items-center gap-4">
                  {banner && (
                    <div className="relative w-full h-40">
                      <img
                        src={banner}
                        alt="Banner preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setBanner(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {!banner && (
                    <label className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                      <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Bannière</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading 
                    ? 'Enregistrement...' 
                    : hasStore 
                      ? 'Enregistrer les modifications' 
                      : 'Créer ma boutique'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="p-6">
            <div className="space-y-6">
              {Object.entries(storeData.openingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setStoreData({
                        ...storeData,
                        openingHours: {
                          ...storeData.openingHours,
                          [day]: { ...hours, open: e.target.value }
                        }
                      })}
                      disabled={hours.closed}
                    />
                    <span>à</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setStoreData({
                        ...storeData,
                        openingHours: {
                          ...storeData.openingHours,
                          [day]: { ...hours, close: e.target.value }
                        }
                      })}
                      disabled={hours.closed}
                    />
                    <Button
                      type="button"
                      variant={hours.closed ? 'destructive' : 'outline'}
                      onClick={() => setStoreData({
                        ...storeData,
                        openingHours: {
                          ...storeData.openingHours,
                          [day]: { ...hours, closed: !hours.closed }
                        }
                      })}
                    >
                      {hours.closed ? 'Fermé' : 'Ouvert'}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading 
                    ? 'Enregistrement...' 
                    : hasStore 
                      ? 'Enregistrer les modifications' 
                      : 'Créer ma boutique'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Facebook
                </label>
                <Input
                  value={storeData.facebook}
                  onChange={(e) => setStoreData({ ...storeData, facebook: e.target.value })}
                  placeholder="URL de votre page Facebook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Instagram
                </label>
                <Input
                  value={storeData.instagram}
                  onChange={(e) => setStoreData({ ...storeData, instagram: e.target.value })}
                  placeholder="URL de votre compte Instagram"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading 
                    ? 'Enregistrement...' 
                    : hasStore 
                      ? 'Enregistrer les modifications' 
                      : 'Créer ma boutique'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
