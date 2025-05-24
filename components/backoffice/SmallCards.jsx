import React, { useState, useEffect } from 'react'
import SmallCard from './SmallCard'
import { Boxes, PackageCheck, PackageSearch, Truck } from 'lucide-react'
import toast from 'react-hot-toast';

export default function SmallCards() {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la récupération des statistiques de commandes');
        }
        
        const data = await response.json();
        console.log('Dashboard order stats:', data.orderStats);
        
        if (data.orderStats) {
          setOrderStats({
            total: data.orderStats.total || 0,
            pending: data.orderStats.pending || 0,
            processing: data.orderStats.processing || 0,
            delivered: data.orderStats.delivered || 0
          });
        }
      } catch (error) {
        console.error('Error fetching order stats:', error);
        toast.error("Erreur lors du chargement des statistiques de commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  const stats = [
    {
      title: 'Total Order',
      number: orderStats.total,
      iconBg: 'bg-green-600',
      icon: Boxes
    },
    {
      title: 'Pending Orders',
      number: orderStats.pending,
      iconBg: 'bg-blue-600',
      icon: PackageSearch
    },
    {
      title: 'Processing Orders',
      number: orderStats.processing,
      iconBg: 'bg-orange-600',
      icon: Truck
    },
    {
      title: 'Deliverd Orders',
      number: orderStats.delivered,
      iconBg: 'bg-purple-600',
      icon: PackageCheck
    },
  ]
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8'>
      {
        stats.map((data, i) => {
          return (
            <SmallCard data={data} key={i} />
          )
        })
      }
    </div>
  )
}
