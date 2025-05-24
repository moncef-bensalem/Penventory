'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useTheme } from "next-themes";
import logoDark from "../../public/logo-dark.svg";
import logoLight from "../../public/logo-light.svg";
import { 
  UserCheck, 
  ShoppingCart, 
  MessageSquare, 
  Store, 
  Users, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  FileText,
  BookOpen 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function ManagerSidebar({showSideBar = true, setShowSideBar = () => {}}) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Les liens pour la navigation du manager
  const managerLinks = [
    {
      title: 'Tableau de bord',
      icon: LayoutDashboard,
      route: '/manager/dashboard'
    },
    {
      title: 'Listes Scolaires',
      icon: BookOpen,
      route: '/manager/dashboard/listes-scolaires'
    },
    {
      title: 'Approbation Vendeurs',
      icon: UserCheck,
      route: '/manager/dashboard/sellers'
    },
    {
      title: 'Transactions',
      icon: ShoppingCart,
      route: '/manager/dashboard/transactions'
    },
    {
      title: 'Support Client',
      icon: MessageSquare,
      route: '/manager/dashboard/support'
    },
    {
      title: 'Approbation Produits',
      icon: Store,
      route: '/manager/dashboard/products'
    },
    {
      title: 'Modération Avis',
      icon: FileText,
      route: '/manager/dashboard/reviews'
    },
    {
      title: 'Gestion Comptes',
      icon: Users,
      route: '/manager/dashboard/accounts'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      route: '/manager/dashboard/settings'
    },
    {
      title: 'Boutique en ligne',
      icon: Store,
      route: '/'
    },
  ];

  return (
    <div className={`mt-16 sm:mt-0 dark:bg-slate-700 bg-white space-y-6 w-64 h-screen text-slate-800 dark:text-slate-50 fixed left-0 top-0 shadow-md overflow-y-scroll transition-transform duration-300 ease-in-out ${showSideBar ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
      <Link onClick={() => setShowSideBar(false)} className='px-6' href="/manager/dashboard">
        <Image src={currentTheme === "dark" ? logoDark : logoLight} alt='PInventory logo' className='ml-6 w-52' priority/>
      </Link>

      <div className='space-y-3 flex flex-col'>
        {managerLinks.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link 
              onClick={() => setShowSideBar(false)} 
              key={i} 
              href={item.route} 
              className={item.route === pathname ?
                'flex items-center space-x-3 px-6 py-3 border-l-8 bg-slate-300 bg-opacity-30 dark:bg-opacity-30 border-orange-600 dark:bg-slate-800 text-orange-600 dark:border-orange-500 dark:text-orange-500' :
                'flex items-center space-x-3 px-6 py-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition duration-200'
              }
            >
              <Icon/>
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="px-6 py-6">
          <button 
            onClick={handleLogout}
            className='w-full bg-orange-600 rounded-md flex items-center space-x-3 px-6 py-3 hover:bg-orange-700 transition-colors text-white justify-center'
          >
            <LogOut className="w-5 h-5"/>
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
} 