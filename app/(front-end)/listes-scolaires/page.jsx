"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, ShoppingCart, Filter, School, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmation } from "@/hooks/use-confirmation";

// Composant d'alerte personnalisé pour l'ajout au panier
function CartAlert({ onClose, onViewCart, onContinueShopping }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300">
      <div className="relative w-full max-w-md p-6 mx-auto rounded-xl shadow-xl bg-white border border-gray-200 transition-all duration-300">
        {/* Effet de brillance */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute -inset-x-40 -inset-y-40 bg-gradient-to-r from-transparent via-orange-50/10 to-transparent transform rotate-45 animate-shimmer"></div>
        </div>
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-50 text-green-500">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Liste ajoutée au panier</h3>
        </div>
        
        <p className="mt-4 text-gray-700">Les articles de la liste scolaire ont été ajoutés au panier avec succès!</p>
        
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onContinueShopping}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Continuer mes achats
          </button>
          <button
            onClick={onViewCart}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
             Voir le panier
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListesScolairesPage() {
  const router = useRouter();
  const [listes, setListes] = useState([]);
  const [filteredListes, setFilteredListes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");
  const [filterEtablissement, setFilterEtablissement] = useState("");
  const [niveaux, setNiveaux] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [showCartAlert, setShowCartAlert] = useState(false);
  const { openConfirmation, ConfirmationDialog } = useConfirmation();

  useEffect(() => {
    fetchListes();
  }, []);

  useEffect(() => {
    if (listes.length > 0) {
      // Extraire les niveaux et établissements uniques pour les filtres
      const uniqueNiveaux = [...new Set(listes.map(liste => liste.niveau))];
      const uniqueEtablissements = [...new Set(listes.map(liste => liste.etablissement))];
      
      setNiveaux(uniqueNiveaux);
      setEtablissements(uniqueEtablissements);
      
      // Appliquer les filtres
      let filtered = [...listes];
      
      if (searchTerm) {
        filtered = filtered.filter(liste => 
          liste.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          liste.etablissement.toLowerCase().includes(searchTerm.toLowerCase()) ||
          liste.niveau.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (filterNiveau && filterNiveau !== 'all_levels') {
        filtered = filtered.filter(liste => liste.niveau === filterNiveau);
      }
      
      if (filterEtablissement && filterEtablissement !== 'all_schools') {
        filtered = filtered.filter(liste => liste.etablissement === filterEtablissement);
      }
      
      setFilteredListes(filtered);
    }
  }, [listes, searchTerm, filterNiveau, filterEtablissement]);

  const fetchListes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/listes-scolaires/published");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des listes scolaires");
      }
      const data = await res.json();
      setListes(data);
      setFilteredListes(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    router.push(`/listes-scolaires/${id}`);
  };

  const handleAddToCart = async (id) => {
    try {
      // Récupérer les détails de la liste scolaire
      const res = await fetch(`/api/listes-scolaires/${id}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des détails de la liste scolaire");
      }
      
      const liste = await res.json();
      
      // Vérifier si la liste a des besoins
      if (!liste.besoins || liste.besoins.length === 0) {
        openConfirmation({
          title: "Liste vide",
          message: "Cette liste scolaire ne contient aucun article à ajouter au panier.",
          confirmText: "OK",
          type: "warning"
        });
        return;
      }
      
      // Demander confirmation avant d'ajouter au panier
      openConfirmation({
        title: "Ajouter la liste au panier",
        message: `Voulez-vous ajouter les ${liste.besoins.length} articles de la liste "${liste.titre || liste.nom}" au panier ?`,
        confirmText: "Ajouter au panier",
        cancelText: "Annuler",
        type: "info",
        onConfirm: () => {
          // Récupérer le panier actuel du localStorage
          const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
          
          // Pour chaque besoin dans la liste, ajouter un produit générique au panier
          liste.besoins.forEach(besoin => {
            // Créer un produit générique basé sur le besoin
            // Vérifier si le besoin a des produits associés avec un prix
            let defaultPrice = 5; // Prix par défaut en DT si aucun produit associé n'est trouvé
            
            // Si le besoin a des produits associés, utiliser le prix du premier produit validé
            if (besoin.produitAssociations && besoin.produitAssociations.length > 0) {
              const validatedAssociations = besoin.produitAssociations.filter(assoc => assoc.validated);
              if (validatedAssociations.length > 0) {
                defaultPrice = validatedAssociations[0].prix || defaultPrice;
              }
            }
            
            const listeProduct = {
              id: `liste-${liste.id}-besoin-${besoin.id}`,
              name: besoin.nomProduit,
              price: defaultPrice, // Utiliser un prix par défaut ou le prix du produit associé
              quantity: besoin.quantite || 1,
              isListeItem: true,
              listeId: liste.id,
              besoinId: besoin.id,
              details: besoin.details || ""
            };
            
            // Vérifier si ce produit de liste est déjà dans le panier
            const existingIndex = currentCart.findIndex(item => 
              item.isListeItem && item.listeId === liste.id && item.besoinId === besoin.id
            );
            
            if (existingIndex >= 0) {
              // Si le produit existe déjà, augmenter la quantité
              currentCart[existingIndex].quantity += besoin.quantite || 1;
            } else {
              // Sinon, ajouter le nouveau produit
              currentCart.push(listeProduct);
            }
          });
          
          // Sauvegarder le panier mis à jour
          localStorage.setItem('cart', JSON.stringify(currentCart));
          
          // Déclencher un événement pour mettre à jour le compteur du panier
          window.dispatchEvent(new Event('storage'));
          
          // Afficher l'alerte personnalisée
          setShowCartAlert(true);
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la liste au panier:", error);
      openConfirmation({
        title: "Erreur",
        message: "Une erreur est survenue lors de l'ajout de la liste au panier.",
        confirmText: "OK",
        type: "danger"
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterNiveau("all_levels");
    setFilterEtablissement("all_schools");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Listes Scolaires</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Trouvez toutes les fournitures scolaires dont vos enfants ont besoin en un seul endroit
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Rechercher une liste..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Select value={filterNiveau} onValueChange={setFilterNiveau}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau scolaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_levels">Tous les niveaux</SelectItem>
                {niveaux.map((niveau, index) => (
                  <SelectItem key={`niveau-${index}-${niveau}`} value={niveau}>
                    {niveau}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filterEtablissement} onValueChange={setFilterEtablissement}>
              <SelectTrigger>
                <SelectValue placeholder="Établissement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_schools">Tous les établissements</SelectItem>
                {etablissements.map((etablissement, index) => (
                  <SelectItem key={`etablissement-${index}-${etablissement}`} value={etablissement}>
                    {etablissement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des listes scolaires...</span>
        </div>
      ) : filteredListes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune liste scolaire trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nous n'avons pas trouvé de listes scolaires correspondant à vos critères.
          </p>
          <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListes.map((liste, index) => (
            <Card key={liste.id || `liste-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{liste.nom}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {liste.annee}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Établissement:</span>
                    <span className="text-sm">{liste.etablissement}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Niveau:</span>
                    <span className="text-sm">{liste.niveau}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Articles:</span>
                    <span className="text-sm">{liste.besoins?.length || 0} articles</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleViewDetails(liste.id)}
                >
                  Voir les détails
                </Button>
                <Button 
                  onClick={() => handleAddToCart(liste.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ConfirmationDialog />
      
      {/* Alerte personnalisée pour l'ajout au panier */}
      {showCartAlert && (
        <CartAlert 
          onClose={() => setShowCartAlert(false)}
          onViewCart={() => {
            setShowCartAlert(false);
            router.push('/cart');
          }}
          onContinueShopping={() => {
            setShowCartAlert(false);
          }}
        />
      )}
    </div>
  );
}
