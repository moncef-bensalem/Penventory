import React from 'react'
import Heading from './Heading'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PageHead({
  title,
  linkTitle,
  route,
  onActionClick,
  backButton,
  backButtonLink
}) {
  const ActionButton = () => {
    if (onActionClick) {
      return (
        <Button 
          onClick={onActionClick}
          className='bg-[#f97316] hover:bg-[#FF4500]/90 text-white'
        >
          <Plus className="mr-2 h-4 w-4" />
          {linkTitle}
        </Button>
      );
    }

    return (
      <Link 
        className='text-white bg-[#f97316] hover:bg-[#FF4500]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#FF4500]/90 me-2 mb-2 space-x-2' 
        href={route}
      >
        <Plus/>
        <span>{linkTitle}</span>
      </Link>
    );
  };

  return (
    <div className="flex items-center justify-between py-4 mb-4">
      <div className="flex items-center space-x-4">
        {backButton && backButtonLink && (
          <Link 
            href={backButtonLink}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </Link>
        )}
        <Heading title={title}/>
      </div>
      {(linkTitle && (route || onActionClick)) && <ActionButton />}
    </div>
  )
}
