"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Eye, BookOpen, School, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

export default function SellerListesScolairesPage() {
  const router = useRouter();
  const [listes, setListes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchListes = async () => {
    setIsLoading(true);
    try {
      // Récupérer uniquement les listes publiées pour les vendeurs
      const res = await fetch("/api/seller/listes-scolaires");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des listes scolaires");
      }
      const data = await res.json();
      setListes(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les listes scolaires");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListes();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredListes = listes.filter(
    (liste) =>
      liste.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liste.classe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liste.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le statut avec la couleur correspondante
  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLIEE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publiée</Badge>;
      case "ARCHIVEE":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archivée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Listes Scolaires</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Associez vos produits aux besoins des listes scolaires
        </p>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rechercher</CardTitle>
          <CardDescription>
            Filtrez les listes scolaires par titre, classe ou description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, classe ou description..."
              className="pl-8 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="mt-4 text-gray-500">Chargement des listes scolaires...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredListes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-orange-100 p-3 mb-4">
              <BookOpen className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aucune liste scolaire</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
              Aucune liste scolaire publiée ne correspond à vos critères de recherche.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Listes scolaires disponibles ({filteredListes.length})</CardTitle>
            <CardDescription>
              Consultez les listes scolaires publiées et associez vos produits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Titre</th>
                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Classe</th>
                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Statut</th>
                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Produits</th>
                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Créée le</th>
                    <th className="text-right p-4 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListes.map((liste) => (
                    <tr key={liste.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{liste.titre}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{liste.classe}</td>
                      <td className="p-4">{getStatusBadge(liste.statut)}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                          {liste.besoins?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {liste.createdAt
                            ? new Date(liste.createdAt).toLocaleDateString('fr-FR')
                            : "Date inconnue"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end">
                          <button
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                            onClick={() =>
                              router.push(`/seller/listes-scolaires/${liste.id}/associer`)
                            }
                            title="Associer des produits"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
