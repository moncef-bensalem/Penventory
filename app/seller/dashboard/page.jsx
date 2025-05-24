'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Package, 
  DollarSign,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    topProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/seller/earnings?period=month');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.overview) {
          setDashboardData({
            revenue: data.overview.revenue || 0,
            orders: data.overview.orders || 0,
            products: data.overview.productsSold || 0,
            customers: data.overview.customers || 0,
            topProducts: data.topProducts || []
          });
        } else {
          console.error('Format de données incorrect:', data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Produits vendus',
      value: loading ? '...' : `${dashboardData.products}`,
      icon: Package,
      href: '/seller/dashboard/products',
      color: 'bg-blue-500'
    },
    {
      label: 'Commandes',
      value: loading ? '...' : `${dashboardData.orders}`,
      icon: ShoppingBag,
      href: '/seller/dashboard/orders',
      color: 'bg-green-500'
    },
    {
      label: 'Chiffre d\'affaires',
      value: loading ? '...' : `${dashboardData.revenue.toFixed(2)} DT`,
      icon: DollarSign,
      href: '/seller/dashboard/earnings',
      color: 'bg-orange-500'
    },
    {
      label: 'Clients',
      value: loading ? '...' : `${dashboardData.customers}`,
      icon: Users,
      href: '/seller/dashboard/customers',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord vendeur</h2>
        <p className="text-muted-foreground">
          Bienvenue, {user?.name}! Voici un aperçu de votre boutique.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Evolution des ventes</h3>
            <Link href="/seller/dashboard/earnings" className="text-sm text-blue-500 hover:underline">
              Voir détails
            </Link>
          </div>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30" />
                <span>Consultez la page "Revenus" pour voir l'évolution de vos ventes</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="col-span-3 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Produits populaires</h3>
            <Link href="/seller/dashboard/products" className="text-sm text-blue-500 hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity || product.quantitySold} vendus • {(product.revenue || product.totalRevenue || 0).toFixed(2)} DT
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun produit vendu pour le moment
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
