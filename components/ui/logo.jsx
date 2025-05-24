'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const Logo = ({ className = '', width = 150, height = 50 }) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Retourner une version statique pour le SSR
    return (
      <Image
        src="/logo-light.svg"
        alt="Logo"
        width={width}
        height={height}
        className={className}
        priority
      />
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = currentTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};
