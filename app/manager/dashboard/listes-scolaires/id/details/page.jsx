"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Trash2, Package, Calendar, User, AlertCircle, BookOpen, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ListeScolaireDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [liste, setListe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListe = async () => {
      try {
        const res = await fetch(`/api/manager/listes-scolaires/${id}`);
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération de la liste scolaire");
        }
        const data = await res.json();
        setListe(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les détails de la liste scolaire");
        router.push("/manager/dashboard/listes-scolaires");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListe();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Liste scolaire supprimée avec succès");
      router.push("/manager/dashboard/listes-scolaires");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer la liste scolaire");
      setIsDeleting(false);
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
      // Mettre à jour l'état local
      setListe(prev => ({
        ...prev,
        statut: "PUBLIEE"
      }));
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de publier la liste scolaire");
    }
  };

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}/archive`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'archivage");
      }

      toast.success("Liste scolaire archivée avec succès");
      // Mettre à jour l'état local
      setListe(prev => ({
        ...prev,
        statut: "ARCHIVEE"
      }));
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'archiver la liste scolaire");
    }
  };

  // Obtenir le statut avec la couleur correspondante
  const getStatusBadge = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
      case "PUBLIEE":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Publiée</Badge>;
      case "ARCHIVEE":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archivée</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Obtenir le statut du besoin avec la couleur correspondante
  const getBesoinStatusBadge = (status) => {
    switch (status) {
      case "NON_COUVERT":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Non couvert</Badge>;
      case "PARTIELLEMENT_COUVERT":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Partiellement couvert</Badge>;
      case "COUVERT":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Couvert</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!liste) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Liste non trouvée</h2>
        <p className="text-gray-600 mb-6">La liste scolaire demandée n'existe pas ou a été supprimée.</p>
        <Button 
          onClick={() => router.push("/manager/dashboard/listes-scolaires")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Retour aux listes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => router.push("/manager/dashboard/listes-scolaires")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux listes
        </Button>
        
        <div className="flex space-x-2">
          {liste.statut === "EN_ATTENTE" && (
            <Button 
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publier
            </Button>
          )}
          
          {liste.statut === "PUBLIEE" && (
            <Button 
              onClick={handleArchive}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              Archiver
            </Button>
          )}
          
          <Button 
            onClick={() => router.push(`/manager/dashboard/listes-scolaires/id/edit`)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{liste.titre}</CardTitle>
              <CardDescription className="mt-1">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
                  Classe: {liste.classe}
                </span>
              </CardDescription>
            </div>
            {getStatusBadge(liste.statut)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Créée le: {new Date(liste.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="text-sm">Nombre de produits: {liste.besoins?.length || 0}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">Créée par: {liste.createdById || "Utilisateur inconnu"}</span>
                </div>
              </div>
            </div>
            
            {liste.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <h4 className="text-sm font-medium mb-2">Description:</h4>
                <p className="text-gray-700 dark:text-gray-300">{liste.description}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Liste des besoins */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Produits requis ({liste.besoins?.length || 0})</h3>
            
            {liste.besoins?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="text-left p-3 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Produit</th>
                      <th className="text-center p-3 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Quantité</th>
                      <th className="text-left p-3 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Détails</th>
                      <th className="text-left p-3 border-b text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liste.besoins.map((besoin, index) => (
                      <tr key={besoin.id} className={`border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <td className="p-3 font-medium">{besoin.nomProduit}</td>
                        <td className="p-3 text-center">{besoin.quantite}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{besoin.details || "-"}</td>
                        <td className="p-3">{getBesoinStatusBadge(besoin.statut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-gray-500">Aucun produit dans cette liste</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
