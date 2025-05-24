import { UploadDropzone } from "@/lib/uploadthing";
import { Pencil } from "lucide-react";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";
import "@uploadthing/react/styles.css";

export default function ImageInput({
  label,
  imageUrl = "",
  setImageUrl,
  className = "col-span-full",
  endpoint = "",
}) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <label
          htmlFor="course-image"
          className="block text-sm font-medium leading-6 dark:text-slate-50 text-slate-800"
        >
          {label}
        </label>
        {imageUrl && (
          <button
            onClick={() => setImageUrl("")}
            type="button"
            className="inline-flex space-x-2 font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-700  py-2 px-4"
          >
            <Pencil className="w-5 h-5" />
            <span>Change Image</span>
          </button>
        )}
      </div>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Item image"
          width={1000}
          height={667}
          className="w-full h-64 object-contain mt-8"
        />
      ) : (
        <UploadDropzone 
        appearance={{
          label: "text-slate-800 dark:text-slate-400 hover:text-orange-500",
          container: "block w-full rounded-md border-0 py-3 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:leading-6 dark:bg-transparent",
          allowedContent:
            "flex h-8 flex-col items-center justify-center px-2 dark:text-slate-50 text-slate-800 ",
        }}
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            setImageUrl(res[0].ufsUrl);
            // Do something with the response
            toast.success("Image has been uploade successfuly")
            console.log("Files: ", res);
            console.log("Upload Completed");
          }}
          onUploadError={(error) => {
            // Do something with the error.
            toast.error("Image Upload failed , try again !")
            console.log(`ERROR! ${error.message}`,error);
          }}
        />
      )}
    </div>
  );
}