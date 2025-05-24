import { 
  LayoutGrid,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';

export const sidebarLinks = [
  {
    title: 'Commandes',
    route: '/dashboard/orders',
    icon: ShoppingBag
  },
  {
    title: 'Clients',
    route: '/dashboard/customers',
    icon: Users
  },
  {
    title: 'Rapports',
    route: '/dashboard/reports',
    icon: BarChart3
  },
  {
    title: 'Pages',
    route: '/dashboard/pages',
    icon: FileText
  },
  {
    title: 'Paramètres',
    route: '/dashboard/settings',
    icon: Settings
  }
];

export const catalogLinks = [
  {
    title: 'Produits',
    route: '/dashboard/products',
    icon: Package
  },
  {
    title: 'Catégories',
    route: '/dashboard/categories',
    icon: Tags
  }
];
