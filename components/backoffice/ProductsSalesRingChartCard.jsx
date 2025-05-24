import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast';

export default function ProductsSalesRingChartCard({ title = "Product Category Sales", subTitle = "Top Categories by Sales" }) {
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard/categories-summary');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la récupération des statistiques de catégories');
        }
        
        const data = await response.json();
        console.log('Dashboard category stats:', data.categories);
        
        if (data.categories && Array.isArray(data.categories)) {
          // Transformer les données pour qu'elles soient compatibles avec le graphique
          const formattedStats = data.categories
            .slice(0, 6) // Prendre les 6 premières catégories pour une meilleure lisibilité
            .map((category, index) => ({
              name: category.name,
              value: Number(category.totalSales),
              fill: getColorByIndex(index)
            }));
          
          setCategoryStats(formattedStats);
        }
      } catch (error) {
        console.error('Error fetching category stats:', error);
        toast.error("Erreur lors du chargement des statistiques de catégories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  // Fonction pour générer des couleurs pour le graphique
  const getColorByIndex = (index) => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    return colors[index % colors.length];
  };

  // Ajouter une version de secours si les données sont vides
  const renderData = categoryStats.length > 0 ? categoryStats : [
    { name: 'Aucune donnée', value: 1, fill: '#cccccc' }
  ];

  return (
    <Card className='col-span-1 md:col-span-2 flex flex-col bg-background'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subTitle}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex justify-center items-center'>
        {loading ? (
          <div className="flex items-center justify-center h-52">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={renderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} TND`, 'Ventes']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
} 