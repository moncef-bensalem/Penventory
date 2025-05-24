'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, ShoppingCart, MessageSquare, Store, FilePenLine, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingSellers: 0,
    pendingProducts: 0,
    supportTickets: 0,
    reviewsToModerate: 0,
    recentTransactions: 0,
    transactionGrowth: 0,
    transactionData: {
      labels: [],
      values: []
    },
    recentActivities: []
  });

  // Récupération des données du tableau de bord depuis l'API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/manager/dashboard/stats');
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Données pour le graphique circulaire des actions en attente
  const pendingActionsData = {
    labels: ['Vendeurs', 'Produits', 'Tickets Support', 'Avis'],
    datasets: [
      {
        data: [stats.pendingSellers, stats.pendingProducts, stats.supportTickets, stats.reviewsToModerate],
        backgroundColor: [
          'rgba(234, 88, 12, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(254, 215, 170, 0.7)',
        ],
        borderColor: [
          'rgba(234, 88, 12, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(254, 215, 170, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique linéaire des transactions
  const transactionData = {
    labels: stats.transactionData?.labels || [],
    datasets: [
      {
        label: 'Transactions',
        data: stats.transactionData?.values || [],
        fill: false,
        backgroundColor: 'rgba(234, 88, 12, 0.5)',
        borderColor: 'rgba(234, 88, 12, 1)',
      },
    ],
  };

  const statCards = [
    {
      title: "Vendeurs en attente",
      value: stats.pendingSellers,
      description: "Vendeurs nécessitant validation",
      icon: <UserCheck className="h-5 w-5 text-orange-600" />,
      linkTo: "/manager/dashboard/sellers"
    },
    {
      title: "Produits à valider",
      value: stats.pendingProducts,
      description: "Produits en attente d'approbation",
      icon: <Store className="h-5 w-5 text-orange-500" />,
      linkTo: "/manager/dashboard/products"
    },
    {
      title: "Tickets de support",
      value: stats.supportTickets,
      description: "Tickets non résolus",
      icon: <MessageSquare className="h-5 w-5 text-orange-400" />,
      linkTo: "/manager/dashboard/support"
    },
    {
      title: "Avis à modérer",
      value: stats.reviewsToModerate,
      description: "Avis nécessitant modération",
      icon: <FilePenLine className="h-5 w-5 text-orange-300" />,
      linkTo: "/manager/dashboard/reviews"
    },
  ];

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-700 dark:text-gray-300">Chargement des données...</span>
      </div>
    );
  }

  // Afficher un message d'erreur si la récupération des données a échoué
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-2">Erreur</p>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <a 
                href={card.linkTo} 
                className="inline-flex items-center mt-3 text-xs text-orange-600 dark:text-orange-400 hover:underline"
              >
                Voir les détails →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Actions en attente</CardTitle>
            <CardDescription>Répartition des tâches nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Doughnut 
                data={pendingActionsData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transactions récentes</CardTitle>
              <CardDescription>Aperçu des transactions sur la plateforme</CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              {stats.transactionGrowth > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${stats.transactionGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(stats.transactionGrowth)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={transactionData} 
                options={{
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Activités récentes</CardTitle>
          <CardDescription>Les dernières actions effectuées sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-orange-50 dark:bg-slate-800/30">
                  <div className="rounded-full bg-orange-100 dark:bg-slate-700 p-2">
                    {activity.type === 'seller_request' && <UserCheck className="h-5 w-5 text-orange-600" />}
                    {activity.type === 'product_submit' && <Store className="h-5 w-5 text-orange-500" />}
                    {activity.type === 'support_ticket' && <MessageSquare className="h-5 w-5 text-orange-400" />}
                    {activity.type === 'review_flagged' && <FilePenLine className="h-5 w-5 text-orange-300" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{activity.user}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>Aucune activité récente à afficher</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 