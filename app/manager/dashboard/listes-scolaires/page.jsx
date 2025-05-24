"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Eye, Pencil, Trash2, BookOpen, School, Package, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

export default function ListesScolairesPage() {
  const router = useRouter();
  const [listes, setListes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    publiees: 0,
    archivees: 0,
    totalBesoins: 0
  });

  const fetchListes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manager/listes-scolaires");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des listes scolaires");
      }
      const data = await res.json();
      setListes(data);
      
      // Calculer les statistiques
      const stats = {
        total: data.length,
        enAttente: data.filter(liste => liste.statut === "EN_ATTENTE").length,
        publiees: data.filter(liste => liste.statut === "PUBLIEE").length,
        archivees: data.filter(liste => liste.statut === "ARCHIVEE").length,
        totalBesoins: data.reduce((total, liste) => total + (liste.besoins?.length || 0), 0)
      };
      setStats(stats);
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

  const handleDelete = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Liste scolaire supprimée avec succès");
      fetchListes();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer la liste scolaire");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredListes = listes.filter(
    (liste) =>
      liste.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liste.classe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liste.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cartes de statistiques
  const statCards = [
    {
      title: "Total des listes",
      value: stats.total,
      description: "Listes scolaires créées",
      icon: <BookOpen className="h-5 w-5 text-orange-600" />
    },
    {
      title: "En attente",
      value: stats.enAttente,
      description: "Listes non publiées",
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />
    },
    {
      title: "Publiées",
      value: stats.publiees,
      description: "Listes actives",
      icon: <School className="h-5 w-5 text-orange-400" />
    },
    {
      title: "Produits requis",
      value: stats.totalBesoins,
      description: "Total des besoins",
      icon: <Package className="h-5 w-5 text-orange-300" />
    },
  ];

  // Obtenir le statut avec la couleur correspondante
  const getStatusBadge = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">En attente</span>;
      case "PUBLIEE":
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Publiée</span>;
      case "ARCHIVEE":
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Archivée</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Listes Scolaires</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les listes de fournitures scolaires pour les établissements
          </p>
        </div>
        <button 
          onClick={() => router.push("/manager/dashboard/listes-scolaires/new")}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md shadow-sm flex items-center transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle liste
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{card.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
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
              Aucune liste scolaire ne correspond à vos critères de recherche ou aucune liste n'a été créée.
            </p>
            <button 
              onClick={() => router.push("/manager/dashboard/listes-scolaires/new")}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md shadow-sm flex items-center transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" /> Créer une nouvelle liste
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Listes scolaires ({filteredListes.length})</CardTitle>
            <CardDescription>
              Consultez et gérez toutes les listes scolaires
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
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                            onClick={() =>
                              router.push(`/manager/dashboard/listes-scolaires/${liste.id}/details`)
                            }
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-md transition-colors"
                            onClick={() =>
                              router.push(`/manager/dashboard/listes-scolaires/${liste.id}/edit`)
                            }
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                            onClick={() => handleDelete(liste.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
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
