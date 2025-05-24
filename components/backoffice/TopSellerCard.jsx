import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TopSellerCard() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la récupération des meilleurs vendeurs');
        }

        const data = await response.json();
        
        if (data.topSellers && Array.isArray(data.topSellers)) {
          setSellers(data.topSellers);
        }
      } catch (error) {
        console.error('Error fetching top sellers:', error);
        toast.error("Erreur lors du chargement des meilleurs vendeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  return (
    <Card className="col-span-1 md:col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Meilleurs Vendeurs</CardTitle>
        <CardDescription>
          {loading 
            ? 'Chargement des données des vendeurs...' 
            : sellers.length > 0 
              ? 'Vendeurs les plus performants ce mois-ci' 
              : 'Aucun vendeur à afficher'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-52">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun vendeur à afficher
          </div>
        ) : (
          <Table>
            <TableCaption>Top vendeurs basé sur le chiffre d'affaires</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Vendeur</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Produits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={seller.image || ''} alt={seller.name || 'Seller'} />
                      <AvatarFallback>{(seller.name || 'S').substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{seller.name || 'Vendeur'}</div>
                      <div className="text-sm text-muted-foreground">{seller.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{seller.orderCount || 0}</TableCell>
                  <TableCell>{formatCurrency(seller.revenue || 0)}</TableCell>
                  <TableCell>{seller.productCount || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/dashboard/sellers">
            Voir tous les vendeurs <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 