'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useTheme } from "next-themes";
import logoDark from "../../public/logo-dark.svg";
import logoLight from "../../public/logo-light.svg";
import { Archive, BadgePercent, BookImage, BookOpen, BringToFront, ChevronDown, ChevronRight, LayoutGrid, LibraryBig, LogOut, Package, Settings, ShoppingBag, Store } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function SellerSidebar({showSideBar = true, setShowSideBar = () => {}}) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);

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

  const catalogLinks = [
    {
      title: 'Mes produits',
      icon: LibraryBig,
      route: '/seller/products'
    },
    {
      title: 'Catégories',
      icon: Archive,
      route: '/seller/categories'
    },
    {
      title: 'Promotions',
      icon: BadgePercent,
      route: '/seller/promotions'
    },
  ];

  const sidebarLinks = [
    {
      title: 'Tableau de bord',
      icon: LayoutGrid,
      route: '/seller'
    },
    {
      title: 'Commandes',
      icon: BringToFront,
      route: '/seller/orders'
    },
    {
      title: 'Mon magasin',
      icon: Store,
      route: '/seller/store'
    },
    {
      title: 'Listes scolaires',
      icon: BookOpen,
      route: '/seller/listes-scolaires'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      route: '/seller/settings'
    },
    {
      title: 'Boutique en ligne',
      icon: ShoppingBag,
      route: '/'
    },
  ];

  return (
    <div className={`mt-16 sm:mt-0 dark:bg-slate-700 bg-white space-y-6 w-64 h-screen text-slate-800 dark:text-slate-50 fixed left-0 top-0 shadow-md overflow-y-scroll transition-transform duration-300 ease-in-out ${showSideBar ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
      <Link onClick={() => setShowSideBar(false)} className='px-6' href="/seller">
        <Image src={currentTheme === "dark" ? logoDark : logoLight} alt='PInventory logo' className='ml-6 w-52' priority/>
      </Link>
      <div className='space-y-3 flex flex-col'>
        <Link 
          onClick={() => setShowSideBar(false)} 
          href="/seller" 
          className={pathname.startsWith('/seller') && pathname !== '/seller/dashboard/listes-scolaires' && !pathname.startsWith('/seller/products') && !pathname.startsWith('/seller/categories') && !pathname.startsWith('/seller/promotions') && !pathname.startsWith('/seller/orders') && !pathname.startsWith('/seller/store') && !pathname.startsWith('/seller/settings') ? 
            'flex items-center space-x-3 px-6 py-3 border-l-8 bg-slate-300 bg-opacity-30 dark:bg-opacity-30 border-orange-600 dark:bg-slate-800 text-orange-600 dark:border-orange-500 dark:text-orange-500' : 
            'flex items-center space-x-3 px-6 py-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition duration-200'
          }
        >
          <LayoutGrid/>
          <span>Tableau de bord</span>
        </Link>

        <Collapsible className='px-6'>
          <CollapsibleTrigger className='flex items-center space-x-20 py-3 w-full hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition duration-200' onClick={() => setOpenMenu(!openMenu)}>
            <div className="flex items-center space-x-3">
              <Package/>
              <span>Catalogue</span>
            </div>
            {openMenu ? <ChevronDown width={20} height={20}/> : <ChevronRight width={20} height={20}/>}
          </CollapsibleTrigger>
          <div className='ml-6'>
            <CollapsibleContent className='rounded-lg dark:bg-slate-800 bg-slate-100'>
              {catalogLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link 
                    onClick={() => setShowSideBar(false)} 
                    key={i} 
                    href={item.route} 
                    className={pathname.startsWith(item.route) ?
                      'flex items-center rounded-lg space-x-3 px-6 py-3 text-sm border-l-4 bg-slate-300 bg-opacity-30 dark:bg-opacity-30 border-orange-600 dark:bg-slate-950 text-orange-600 dark:border-orange-500 dark:text-orange-500' :
                      'flex items-center rounded-lg text-sm space-x-3 px-6 py-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition duration-200'
                    }
                  >
                    <Icon className='w-4 h-4'/>
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {sidebarLinks.slice(1).map((item, i) => {
          const Icon = item.icon;
          return (
            <Link 
              onClick={() => setShowSideBar(false)} 
              key={i} 
              href={item.route} 
              className={pathname.startsWith(item.route) ?
                'flex items-center space-x-3 px-6 py-3 border-l-8 bg-slate-300 bg-opacity-30 dark:bg-opacity-30 border-orange-600 dark:bg-slate-800 text-orange-600 dark:border-orange-500 dark:text-orange-500' :
                'flex items-center space-x-3 px-6 py-3 hover:bg-slate-200 dark:hover:bg-slate-600 transition duration-200'
              }
            >
              <Icon/>
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="px-6 py-2">
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
