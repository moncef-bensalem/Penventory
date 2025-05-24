import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, RefreshCcwIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalesOverviewCard() {
  const [salesData, setSalesData] = useState({
    stats: { revenue: 0, orders: 0, products: 0 },
    chartData: [],
    period: 'semaine',
    loading: true,
  });

  const fetchSalesOverview = async (period = 'semaine') => {
    try {
      setSalesData(prev => ({ ...prev, loading: true }));
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de vente');
      }
      
      const data = await response.json();
      
      setSalesData({
        stats: {
          revenue: data.totalRevenue || 0,
          orders: data.orderCount || 0,
          products: data.productCount || 0,
          revenueChange: data.revenueChange || 0,
          orderChange: data.orderChange || 0,
          productChange: data.productChange || 0,
        },
        chartData: data.salesChart || [],
        period: period,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error("Erreur lors du chargement des données de vente");
      setSalesData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSalesOverview('semaine');
  }, []);

  const handleTabChange = (value) => {
    fetchSalesOverview(value);
  };

  const handleRefresh = () => {
    fetchSalesOverview(salesData.period);
    toast.success('Données rafraîchies');
  };

  // Formater les données pour l'affichage
  const formatChange = (value) => {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '0%';
  };

  // Déterminer la couleur en fonction de la variation
  const getChangeColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Déterminer l'icône en fonction de la variation
  const getChangeIcon = (value) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <Card className="col-span-1 md:col-span-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vue d'ensemble des ventes</CardTitle>
            <CardDescription>
              {salesData.loading
                ? 'Chargement des données...'
                : `Résumé des ventes pour cette ${salesData.period}`}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcwIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {salesData.loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</div>
                <div className="text-2xl font-bold">{formatCurrency(salesData.stats.revenue)}</div>
                <div className="flex items-center mt-1">
                  {getChangeIcon(salesData.stats.revenueChange)}
                  <span className={`text-sm ${getChangeColor(salesData.stats.revenueChange)}`}>
                    {formatChange(salesData.stats.revenueChange)}
                  </span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Commandes</div>
                <div className="text-2xl font-bold">{salesData.stats.orders}</div>
                <div className="flex items-center mt-1">
                  {getChangeIcon(salesData.stats.orderChange)}
                  <span className={`text-sm ${getChangeColor(salesData.stats.orderChange)}`}>
                    {formatChange(salesData.stats.orderChange)}
                  </span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Produits</div>
                <div className="text-2xl font-bold">{salesData.stats.products}</div>
                <div className="flex items-center mt-1">
                  {getChangeIcon(salesData.stats.productChange)}
                  <span className={`text-sm ${getChangeColor(salesData.stats.productChange)}`}>
                    {formatChange(salesData.stats.productChange)}
                  </span>
                </div>
              </div>
            </div>

            <Tabs 
              defaultValue="semaine" 
              value={salesData.period}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="semaine">Cette semaine</TabsTrigger>
                <TabsTrigger value="mois">Ce mois</TabsTrigger>
                <TabsTrigger value="annee">Cette année</TabsTrigger>
              </TabsList>
              <TabsContent value={salesData.period} className="p-0 border-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData.chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          return name === 'revenue' 
                            ? [formatCurrency(value), 'Revenu'] 
                            : [value, name === 'orders' ? 'Commandes' : 'Produits'];
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        name="Revenu" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#82ca9d" 
                        name="Commandes" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <a href="/admin/dashboard/analytics">Voir les analyses détaillées</a>
        </Button>
      </CardFooter>
    </Card>
  )
} 