'use client'
import FormHeader from "@/components/backoffice/FormHeader";
import ImageInput from "@/components/FormInputs/ImageInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextAreaInput from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import { makePostRequest } from "@/lib/apiRequest";
import { generateSlug } from "@/lib/generateSlug";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function NewCategory() {
  const [imageUrl,setImageUrl] = useState("")
  const [loading,setLoading] = useState(false)
    const {register,reset,handleSubmit,formState:{errors}} = useForm()
    const parentCategories = [
      { id: "1", title: "Writing Tools" },
      { id: "2", title: "Paper Products" },
      { id: "3", title: "Books & Stories" },
      { id: "4", title: "Office Supplies" },
      { id: "5", title: "Art/Craft Supplies" },
      { id: "6", title: "School Supplies" },
      { id: "7", title: "Technology & Accessories" },
      { id: "8", title: "Gifts & Games" },
    ];
    async function onSubmit(data){
      if (!imageUrl) {
        toast.error("Please upload an image before submitting!");
        return;  // Stop the function if no image is uploaded
      }
      {/* 
        id => auto generated
        title
        slug => auto generated
        supercategory
        description
        image  
      */}
      const slug = generateSlug(data.title)
      data.slug = slug
      data.imageUrl=imageUrl
      console.log(data)
      makePostRequest(
        setLoading,
        'api/categories',
        data,
        'Category',
        reset
      )
      setImageUrl("")
    }
  return (
    <div>
      <FormHeader title="Adding New Category"/>
      {/* Form Fields */}

        <form onSubmit={handleSubmit(onSubmit)}  className="w-full max-w-4xl p-4 bg-slate-50 border  border-slate-200 rounded-lg shadow-lg sm:p-6 md:p-8 dark:bg-slate-700 dark:border-slate-700 mx-auto my-3">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 ">
            <TextInput
                label="Category Title"
                name="title"
                register={register}
                errors={errors}
            />
            <SelectInput
            label="Parent Category"
            name="parentcategory"
            register={register}
            options = {parentCategories}
            />
           <TextAreaInput
            label="Category Description"
            name="description"
            register={register}
            errors={errors}
            />
            <ImageInput
            label="Category Image"
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            endpoint="categoryImageUploader"
            />
            <SubmitButton
            isLoading={loading}
            buttonTitle="Creating New Category"
            loadingButtonTitle="Creating Category , please wait ..."
            />
            </div>
        </form>
      
    </div>
  );
}
