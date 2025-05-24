'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PromotionsTestPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [dbTest, setDbTest] = useState(null);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [altPromotions, setAltPromotions] = useState([]);
  const [altError, setAltError] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [altLoading, setAltLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState(null);
  const [newPromotions, setNewPromotions] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminPromotions, setAdminPromotions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    // Ne pas charger automatiquement pour éviter les erreurs répétées
    if (user && user.role === 'ADMIN') {
      testDbConnection();
    }
  }, [user]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching promotions...');
      
      const response = await fetch('/api/admin/promotions');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des promotions');
      }
      
      const data = await response.json();
      console.log('Promotions raw data:', JSON.stringify(data, null, 2));
      
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testDbConnection = async () => {
    try {
      setLoading(true);
      console.log('Testing DB connection...');
      
      const response = await fetch('/api/admin/test-db');
      const data = await response.json();
      
      console.log('DB test result:', data);
      setDbTest(data);
      
      if (data.success) {
        console.log('DB connection successful!');
      } else {
        console.error('DB connection failed:', data.error);
      }
    } catch (error) {
      console.error('Error testing DB:', error);
      setDbTest({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkSchema = async () => {
    try {
      setSchemaLoading(true);
      console.log('Vérification du schéma...');
      
      const response = await fetch('/api/admin/schema-check');
      const data = await response.json();
      
      console.log('Schema check result:', data);
      setSchemaInfo(data);
    } catch (error) {
      console.error('Error checking schema:', error);
      setSchemaError(error.message);
    } finally {
      setSchemaLoading(false);
    }
  };

  const fetchAlternativePromotions = async () => {
    try {
      setAltLoading(true);
      setAltError(null);
      console.log('Fetching promotions (alternative)...');
      
      const response = await fetch('/api/admin/promotions-alt');
      console.log('Alternative API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Alternative API error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération alternative des promotions');
      }
      
      const data = await response.json();
      console.log('Alternative promotions data:', JSON.stringify(data, null, 2));
      
      setAltPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching alternative promotions:', error);
      setAltError(error.message);
    } finally {
      setAltLoading(false);
    }
  };

  const fetchNewPromotions = async () => {
    try {
      setNewLoading(true);
      setNewError(null);
      console.log('Fetching promotions from the new API route...');
      
      const response = await fetch('/api/admin/promotions-new', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('New promotions API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: 'Erreur inconnue' }));
        console.error('Error with new API:', errorData);
        setNewError(errorData.error || 'Erreur lors de la récupération des promotions');
        throw new Error(errorData.error || 'Erreur lors de la récupération des promotions');
      }
      
      const data = await response.json();
      console.log('New API response:', data);
      
      if (data && data.promotions && Array.isArray(data.promotions)) {
        setNewPromotions(data.promotions);
        toast.success(`${data.promotions.length} promotions récupérées avec succès via la nouvelle API`);
      } else {
        setNewError('Format de données invalide depuis la nouvelle API');
        toast.error('Format de données invalide depuis la nouvelle API');
      }
    } catch (error) {
      console.error('Error fetching new promotions:', error);
      setNewError(error.message || 'Erreur lors de la récupération des promotions');
      toast.error(error.message || 'Erreur lors de la récupération des promotions');
    } finally {
      setNewLoading(false);
    }
  };

  const fetchAdminPromotions = async () => {
    try {
      setAdminLoading(true);
      setAdminError(null);
      console.log('Fetching promotions from the admin API...');
      
      const response = await fetch('/api/admin/promotions-admin', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Admin promotions API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: 'Erreur inconnue' }));
        console.error('Error with admin API:', errorData);
        setAdminError(errorData.error || 'Erreur lors de la récupération des promotions');
        throw new Error(errorData.error || 'Erreur lors de la récupération des promotions');
      }
      
      const data = await response.json();
      console.log('Admin API response:', data);
      
      if (data && data.promotions && Array.isArray(data.promotions)) {
        setAdminPromotions(data.promotions);
        if (data.stats) {
          setAdminStats(data.stats);
        }
        toast.success(`${data.promotions.length} promotions récupérées avec succès via l'API d'administration`);
      } else {
        setAdminError('Format de données invalide depuis l\'API d\'administration');
        toast.error('Format de données invalide depuis l\'API d\'administration');
      }
    } catch (error) {
      console.error('Error fetching admin promotions:', error);
      setAdminError(error.message || 'Erreur lors de la récupération des promotions');
      toast.error(error.message || 'Erreur lors de la récupération des promotions');
    } finally {
      setAdminLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-6">Accès non autorisé. Vous devez être un administrateur.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test API et Base de données</h1>
      
      <div className="space-y-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Vérification du Schéma</CardTitle>
            <CardDescription>Vérifie la structure de la base de données</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button 
                onClick={checkSchema} 
                disabled={schemaLoading}
                variant="outline"
              >
                {schemaLoading ? 'Vérification...' : 'Vérifier le Schéma'}
                {schemaLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
            
            {schemaError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{schemaError}</AlertDescription>
              </Alert>
            )}
            
            {schemaInfo && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-md font-semibold mb-2">Modèles Détectés</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {schemaInfo.schemaInfo && Object.entries(schemaInfo.schemaInfo).map(([modelName, info]) => (
                      <Card key={modelName} className={info.exists ? 'border-green-300' : 'border-red-300'}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{modelName}</div>
                            {info.exists ? 
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Existe</Badge> : 
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Manquant</Badge>
                            }
                          </div>
                          {info.exists && <div className="text-sm text-gray-500">{info.count} enregistrements</div>}
                          {info.error && <div className="text-sm text-red-500 mt-1">{info.error}</div>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {schemaInfo.promotionCheck && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-md font-semibold mb-2">Relations des Promotions</h3>
                      {schemaInfo.promotionCheck.relations.store && (
                        <div className="mb-3">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Relation Promotion → Store:</span>
                            {schemaInfo.promotionCheck.relations.store.exists ? 
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">OK</Badge> : 
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Problème</Badge>
                            }
                          </div>
                          {schemaInfo.promotionCheck.relations.store.example && (
                            <div className="text-sm mt-1 ml-4">
                              <div>Promotion ID: {schemaInfo.promotionCheck.relations.store.example.promotionId}</div>
                              <div>Store ID: {schemaInfo.promotionCheck.relations.store.example.storeId}</div>
                              <div>Store Name: {schemaInfo.promotionCheck.relations.store.example.storeName || 'N/A'}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {schemaInfo.promotionCheck.relations.seller && (
                        <div className="mb-3">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Relation Store → Seller:</span>
                            {schemaInfo.promotionCheck.relations.seller.exists ? 
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">OK</Badge> : 
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Problème</Badge>
                            }
                          </div>
                          {schemaInfo.promotionCheck.relations.seller.example && (
                            <div className="text-sm mt-1 ml-4">
                              <div>Store ID: {schemaInfo.promotionCheck.relations.seller.example.storeId}</div>
                              <div>Seller ID: {schemaInfo.promotionCheck.relations.seller.example.sellerId}</div>
                              <div>Seller Name: {schemaInfo.promotionCheck.relations.seller.example.sellerName || 'N/A'}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {schemaInfo.promotionCheck.tableStructure && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-md font-semibold mb-2">Structure des Tables</h3>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="store-structure">
                              <AccordionTrigger>Structure de la table Store</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm">
                                  <ul className="space-y-1">
                                    {schemaInfo.promotionCheck.tableStructure.store.map((column, index) => (
                                      <li key={index} className="grid grid-cols-2">
                                        <span className="font-medium">{column.COLUMN_NAME}</span>
                                        <span>{column.DATA_TYPE}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="promotion-structure">
                              <AccordionTrigger>Structure de la table Promotion</AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm">
                                  <ul className="space-y-1">
                                    {schemaInfo.promotionCheck.tableStructure.promotion.map((column, index) => (
                                      <li key={index} className="grid grid-cols-2">
                                        <span className="font-medium">{column.COLUMN_NAME}</span>
                                        <span>{column.DATA_TYPE}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test de connexion à la base de données</h2>
          <button 
            onClick={testDbConnection}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
            disabled={loading}
          >
            {loading ? 'Test en cours...' : 'Tester la connexion DB'}
          </button>
          
          {dbTest && (
            <div className={`p-4 rounded ${dbTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="font-bold">{dbTest.success ? 'Succès' : 'Échec'}</h3>
              <p>{dbTest.message}</p>
              {dbTest.stores && (
                <div className="mt-2">
                  <p>Magasins trouvés: {dbTest.stores.length}</p>
                  {dbTest.stores.length > 0 && (
                    <ul className="list-disc pl-5 mt-2">
                      {dbTest.stores.map(store => (
                        <li key={store.id}>
                          {store.name} - Propriétaire: {store.owner?.name || 'Inconnu'}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test des API de Promotion</CardTitle>
            <CardDescription>
              Tester les différentes routes API pour récupérer les promotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Button 
                  onClick={fetchPromotions} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tester l'API Standard
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Button 
                  onClick={fetchAlternativePromotions} 
                  disabled={altLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {altLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tester l'API Alternative
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Button 
                  onClick={fetchNewPromotions} 
                  disabled={newLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {newLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tester la Nouvelle API
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Button 
                  onClick={fetchAdminPromotions} 
                  disabled={adminLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {adminLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tester l'API Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Affichage des erreurs */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur de l'API standard</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {altError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur de l'API alternative</AlertTitle>
                <AlertDescription>{altError}</AlertDescription>
              </Alert>
            )}
            
            {newError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur de la nouvelle API</AlertTitle>
                <AlertDescription>{newError}</AlertDescription>
              </Alert>
            )}
            
            {adminError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur de l'API admin</AlertTitle>
                <AlertDescription>{adminError}</AlertDescription>
              </Alert>
            )}
            
            {/* Résultats */}
            {promotions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Promotions de l'API standard ({promotions.length})
                </h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(promotions[0], null, 2)}</pre>
                </div>
              </div>
            )}
            
            {altPromotions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Promotions de l'API alternative ({altPromotions.length})
                </h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(altPromotions[0], null, 2)}</pre>
                </div>
              </div>
            )}
            
            {newPromotions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Promotions de la nouvelle API ({newPromotions.length})
                </h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(newPromotions[0], null, 2)}</pre>
                </div>
              </div>
            )}
            
            {adminPromotions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Promotions de l'API admin ({adminPromotions.length})
                </h3>
                
                {adminStats && (
                  <div className="bg-gray-100 p-4 mb-4 rounded-md">
                    <h4 className="font-semibold mb-2">Statistiques:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-xl font-bold">{adminStats.total}</div>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Actives</div>
                        <div className="text-xl font-bold text-green-600">{adminStats.activeCount}</div>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Expirées</div>
                        <div className="text-xl font-bold text-orange-600">{adminStats.expiredCount}</div>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <div className="text-sm text-gray-500">Magasins</div>
                        <div className="text-xl font-bold text-blue-600">{adminStats.storeCount}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(adminPromotions[0], null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 