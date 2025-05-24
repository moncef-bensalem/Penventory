'use client';

import { UploadButton, UploadDropzone } from '@uploadthing/react';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { ourFileRouter } from '@/app/api/uploadthing/core';

const UploadthingProvider = ({ children }) => {
  return (
    <>
      <NextSSRPlugin
        uploadthingId={process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}
        router={ourFileRouter}
      />
      {children}
    </>
  );
};

export default UploadthingProvider;
