'use client';

import { useLanguage } from '../context/language-context';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('selectLanguage')}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('fr')} 
          className={`flex items-center ${language === 'fr' ? 'bg-orange-50 text-orange-600' : ''}`}
        >
          <span className="mr-2">🇫🇷</span> {t('french')}
          {language === 'fr' && <span className="ml-auto text-xs text-orange-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')} 
          className={`flex items-center ${language === 'en' ? 'bg-orange-50 text-orange-600' : ''}`}
        >
          <span className="mr-2">🇬🇧</span> {t('english')}
          {language === 'en' && <span className="ml-auto text-xs text-orange-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
