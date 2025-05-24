"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Package, Check, AlertCircle, ShoppingBag, Store, User, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ValidateAssociationsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [liste, setListe] = useState(null);
  const [besoins, setBesoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssociations, setSelectedAssociations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les détails de la liste scolaire
        const listeRes = await fetch(`/api/manager/listes-scolaires/${id}`);
        if (!listeRes.ok) {
          throw new Error("Erreur lors de la récupération de la liste scolaire");
        }
        const listeData = await listeRes.json();
        setListe(listeData);

        // Récupérer les associations de produits
        const associationsRes = await fetch(`/api/manager/listes-scolaires/${id}/associations`);
        if (!associationsRes.ok) {
          throw new Error("Erreur lors de la récupération des associations");
        }
        const associationsData = await associationsRes.json();
        setBesoins(associationsData);

        // Initialiser les associations déjà validées
        const initialSelected = {};
        associationsData.forEach(besoin => {
          besoin.produitAssociations.forEach(assoc => {
            if (assoc.validated) {
              initialSelected[assoc.id] = true;
            }
          });
        });
        setSelectedAssociations(initialSelected);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssociationSelect = (associationId) => {
    setSelectedAssociations(prev => ({
      ...prev,
      [associationId]: !prev[associationId]
    }));
  };

  const handleValidateSelected = async () => {
    const selectedIds = Object.entries(selectedAssociations)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une association à valider");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/manager/listes-scolaires/${id}/associations`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          associationIds: selectedIds,
          validated: true
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la validation des associations");
      }

      toast.success("Associations validées avec succès");
      
      // Rafraîchir les données
      const associationsRes = await fetch(`/api/manager/listes-scolaires/${id}/associations`);
      const associationsData = await associationsRes.json();
      setBesoins(associationsData);
      
      // Vérifier si tous les besoins sont couverts pour permettre la publication
      const allCovered = associationsData.every(besoin => 
        besoin.statut === "COUVERT" || besoin.produitAssociations.some(assoc => assoc.validated)
      );
      
      if (allCovered) {
        toast.success("Tous les besoins sont couverts. Vous pouvez maintenant publier la liste scolaire.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de valider les associations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}/publish`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la publication");
      }

      toast.success("Liste scolaire publiée avec succès");
      router.push(`/manager/dashboard/listes-scolaires/${id}/details`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de publier la liste scolaire");
    }
  };

  // Obtenir le statut du besoin avec la couleur correspondante
  const getBesoinStatusBadge = (status) => {
    switch (status) {
      case "NON_COUVERT":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Non couvert</Badge>;
      case "PARTIELLEMENT_COUVERT":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Partiellement couvert</Badge>;
      case "COUVERT":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Couvert</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Vérifier si tous les besoins sont couverts
  const allBesoinsCovered = besoins.every(besoin => 
    besoin.statut === "COUVERT" || besoin.produitAssociations.some(assoc => assoc.validated)
  );

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        onClick={() => router.push(`/manager/dashboard/listes-scolaires/${id}/details`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux détails
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Validation des produits</CardTitle>
              <CardDescription className="mt-1">
                {liste ? (
                  <>
                    <span className="font-medium">Liste:</span> {liste.titre} | 
                    <span className="font-medium ml-2">Classe:</span> {liste.classe}
                  </>
                ) : "Chargement des détails..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md flex items-start">
                <AlertCircle className="text-blue-500 dark:text-blue-300 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Instructions</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Validez les produits associés par les vendeurs pour chaque besoin de la liste scolaire. 
                    Une fois tous les besoins couverts, vous pourrez publier la liste pour la rendre visible aux clients.
                  </p>
                </div>
              </div>
              
              {besoins.length > 0 ? (
                <div className="space-y-6">
                  {besoins.map(besoin => (
                    <Card key={besoin.id} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="bg-gray-50 dark:bg-gray-800 py-3 px-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{besoin.nomProduit}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {besoin.details || "Aucune description"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getBesoinStatusBadge(besoin.statut)}
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                              <Package className="h-3 w-3 mr-1" />
                              Qté: {besoin.quantite}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {besoin.produitAssociations.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Produits proposés ({besoin.produitAssociations.length})
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="text-left p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Sélection</th>
                                    <th className="text-left p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Produit</th>
                                    <th className="text-left p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Vendeur</th>
                                    <th className="text-center p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Prix (DT)</th>
                                    <th className="text-center p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Quantité disponible</th>
                                    <th className="text-center p-2 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Statut</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {besoin.produitAssociations.map((assoc) => (
                                    <tr key={assoc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="p-2">
                                        <Checkbox 
                                          checked={!!selectedAssociations[assoc.id]}
                                          onCheckedChange={() => handleAssociationSelect(assoc.id)}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <div className="font-medium">{assoc.produit.name}</div>
                                        <div className="text-xs text-gray-500">{assoc.produit.description}</div>
                                      </td>
                                      <td className="p-2">
                                        <div className="flex items-center">
                                          <Store className="h-3 w-3 mr-1 text-gray-400" />
                                          <span>{assoc.produit.store?.name || "Magasin inconnu"}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                          <User className="h-3 w-3 mr-1 text-gray-400" />
                                          <span>{assoc.seller?.name || "Vendeur inconnu"}</span>
                                        </div>
                                      </td>
                                      <td className="p-2 text-center font-medium">{assoc.prix} DT</td>
                                      <td className="p-2 text-center">{assoc.quantiteDisponible}</td>
                                      <td className="p-2 text-center">
                                        {assoc.validated ? (
                                          <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Validé
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                            En attente
                                          </Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-gray-500">Aucun produit associé pour ce besoin</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500">Aucun besoin trouvé dans cette liste</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/manager/dashboard/listes-scolaires/${id}/details`)}
          >
            Annuler
          </Button>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleValidateSelected}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting || Object.keys(selectedAssociations).filter(key => selectedAssociations[key]).length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Valider la sélection
                </>
              )}
            </Button>
            
            <Button 
              onClick={handlePublish}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={liste?.statut === "PUBLIEE"}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Publier la liste
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
