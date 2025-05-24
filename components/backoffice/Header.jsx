'use client';

import { useAuth } from '../../context/auth-context';
import { useLanguage } from '../../context/language-context';
import UserNav from './UserNav';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSelector } from '../LanguageSelector';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Header({ showSideBar, setShowSideBar }) {
  const { t } = useLanguage();
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-700 dark:border-slate-600">
      <div className="flex h-16 items-center px-4 justify-between">
        <Button
          variant="ghost"
          className="sm:hidden"
          onClick={() => setShowSideBar(!showSideBar)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-4 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative" size="icon">
                <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-600"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>{t('notifications')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="cursor-default">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('newOrderReceived')}</p>
                    <p className="text-xs text-gray-500">{t('minutesAgo', { minutes: 5 })}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-default">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('newSupportMessage')}</p>
                    <p className="text-xs text-gray-500">{t('minutesAgo', { minutes: 15 })}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-default">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('lowStockFor', { product: 'Produit X' })}</p>
                    <p className="text-xs text-gray-500">{t('hoursAgo', { hours: 1 })}</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-center text-sm text-blue-600 hover:text-blue-800">
                {t('viewAllNotifications')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <LanguageSelector />
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
