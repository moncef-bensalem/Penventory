'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useTheme } from "next-themes";
import logoDark from "../../public/logo-dark.svg";
import logoLight from "../../public/logo-light.svg";
import { Archive, BadgePercent, BookImage, BringToFront, Building2, ChevronDown, ChevronRight, Handshake, LayoutGrid, LibraryBig, LogOut, MonitorPlay, Settings, ShoppingBag, Store, UserPen, Users, Wallet, Image as ImageIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function Sidebar({showSideBar = true, setShowSideBar = () => {}}) {
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
      title: 'Produits',
      icon: LibraryBig,
      route: '/dashboard/catalogue/products'
    },
    {
      title: 'Catégories',
      icon: Archive,
      route: '/dashboard/catalogue/categories'
    },
  
    {
      title: 'Promotions',
      icon: BadgePercent,
      route: '/dashboard/catalogue/promotions'
    },
    {
      title: 'Bannières',
      icon: MonitorPlay,
      route: '/dashboard/catalogue/banners'
    },
    {
      title: 'Bannières Magasins',
      icon: ImageIcon,
      route: '/dashboard/catalogue/store-banners'
    },
  ];

  const sidebarLinks = [
    {
      title: 'Tableau de bord',
      icon: LayoutGrid,
      route: '/dashboard'
    },
    {
      title: 'Commandes',
      icon: BringToFront,
      route: '/dashboard/orders'
    },
    {
      title: 'Clients',
      icon: Users,
      route: '/dashboard/customers'
    },
    {
      title: 'Magasins',
      icon: Store,
      route: '/dashboard/stores'
    },
    {
      title: 'Vendeurs',
      icon: Handshake,
      route: '/dashboard/sellers'
    },
    {
      title: 'Personnel',
      icon: UserPen,
      route: '/dashboard/staff'
    },
    {
      title: 'Communauté',
      icon: Building2,
      route: '/dashboard/community'
    },
    {
      title: 'Portefeuille',
      icon: Wallet,
      route: '/dashboard/wallet'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      route: '/dashboard/settings'
    },
    {
      title: 'Boutique en ligne',
      icon: ShoppingBag,
      route: '/'
    },
  ];

  return (
    <div className={`mt-16 sm:mt-0 dark:bg-slate-700 bg-white space-y-6 w-64 h-screen text-slate-800 dark:text-slate-50 fixed left-0 top-0 shadow-md overflow-y-scroll transition-transform duration-300 ease-in-out ${showSideBar ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
      <Link onClick={() => setShowSideBar(false)} className='px-6' href="/dashboard">
        <Image src={currentTheme === "dark" ? logoDark : logoLight} alt='PInventory logo' className='ml-6 w-52' priority/>
      </Link>
      <div className='space-y-3 flex flex-col'>
        <Link 
          onClick={() => setShowSideBar(false)} 
          href="/dashboard" 
          className={pathname === '/dashboard' ? 
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
              <BookImage/>
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
                    className={item.route === pathname ?
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