'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  Store,
  Settings,
  DollarSign,
  Users,
  Tag,
  BarChart,
  Layers,
  CreditCard,
  ShoppingCart,
  ExternalLink,
  BookOpen
} from 'lucide-react';

const routes = [
  {
    label: 'Vue d\'ensemble',
    icon: BarChart,
    href: '/seller/dashboard',
  },
  {
    label: 'Produits',
    icon: Package,
    href: '/seller/dashboard/products',
  },
  {
    label: 'Catégories',
    icon: Layers,
    href: '/seller/dashboard/categories',
  },
  {
    label: 'Commandes',
    icon: ShoppingBag,
    href: '/seller/dashboard/orders',
  },
  {
    label: 'Boutique',
    icon: Store,
    href: '/seller/dashboard/store',
  },
  {
    label: 'Listes scolaires',
    icon: BookOpen,
    href: '/seller/listes-scolaires',
  },
  {
    label: 'Promotions',
    icon: Tag,
    href: '/seller/dashboard/promotions',
  },
  {
    label: 'Clients',
    icon: Users,
    href: '/seller/dashboard/customers',
  },
  {
    label: 'Revenus',
    icon: DollarSign,
    href: '/seller/dashboard/earnings',
  },
  {
    label: 'Paramètres',
    icon: Settings,
    href: '/seller/dashboard/settings',
  },
];

// Liens supplémentaires
const additionalLinks = [
  {
    label: 'Abonnement',
    icon: CreditCard,
    href: '/seller/subscription',
    external: false,
  },
  {
    label: 'Boutique en ligne',
    icon: ShoppingCart,
    href: '/',
    external: true,
  },
];

export default function SellerSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full border-r flex flex-col bg-white dark:bg-gray-800">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="space-y-2">
          {/* Liens principaux */}
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-x-2 text-slate-500 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800',
                pathname === route.href && 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800'
              )}
            >
              <route.icon className="w-5 h-5" />
              {route.label}
            </Link>
          ))}
          
          {/* Liens supplémentaires */}
          {additionalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                'flex items-center gap-x-2 text-slate-500 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800',
                pathname === link.href && !link.external && 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800'
              )}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
              {link.external && <ExternalLink className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
