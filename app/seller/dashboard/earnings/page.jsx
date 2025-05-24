'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, PackageIcon, ShoppingCartIcon, CreditCardIcon } from 'lucide-react';

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState({
    overview: {
      revenue: 0,
      revenueGrowth: 0,
      orders: 0,
      ordersGrowth: 0,
      products: 0,
      productsGrowth: 0,
      customers: 0,
      customersGrowth: 0,
      averageOrderValue: 0
    },
    ordersByStatus: [],
    topProducts: [],
    revenueData: []
  });

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/earnings?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Vérifier que les données sont complètes et valides
      if (responseData && responseData.overview) {
        setData(responseData);
      } else {
        toast.error('Format de données incorrect');
        console.error('Format de données incorrect:', responseData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { overview, ordersByStatus, topProducts, revenueData } = data;

  // Formater les données pour le graphique
  const chartData = revenueData.map(item => ({
    date: format(new Date(item.date), 'PP', { locale: fr }),
    revenue: item.revenue
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenus</h2>
          <p className="text-muted-foreground">
            Suivez vos revenus et vos performances de vente
          </p>
        </div>

        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionnez une période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chiffre d'affaires
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {overview.revenue.toFixed(2)} DT
              </h3>
            </div>
            <div className={`flex items-center ${overview.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {overview.revenueGrowth >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(overview.revenueGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-4">
            <TrendingUpIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Commandes
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {overview.orders}
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <ShoppingCartIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Produits vendus
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {overview.productsSold}
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <PackageIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Panier moyen
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {overview.averageOrderValue.toFixed(2)} DT
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <CreditCardIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Évolution des revenus</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Meilleurs produits</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
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
                    {product.quantity} vendus • {product.revenue.toFixed(2)} DT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">État des commandes</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <span className="font-medium capitalize">
                {status.toLowerCase().replace('_', ' ')}
              </span>
              <span className="text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
