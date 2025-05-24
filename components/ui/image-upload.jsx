'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@uploadthing/react';
import { cn } from '@/lib/utils';

export const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  value = [],
  endpoint = "productImage"
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      <UploadButton
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.map((file) => file.url));
        }}
        onUploadError={(error) => {
          console.error('Upload error:', error);
        }}
      />
    </div>
  );
};
