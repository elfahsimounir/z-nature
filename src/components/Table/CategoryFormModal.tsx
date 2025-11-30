"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Trash2, Upload, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof schema> & {
  images?: File[];
};

export default function CategoryFormModal({
  display,
  onSubmit,
  showModal,
  defaultValues,
  parentPath,
  width,
}: {
  display: boolean;
  onSubmit: (data: CategoryFormValues) => void;
  showModal: () => void;
  defaultValues?: Partial<{ id: string; name: string; description: string; image?: string }>;
  parentPath?: string | null;
  width?: string;
}) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [defaultImage, setDefaultImage] = useState<string | undefined>(
    defaultValues?.image
  );

  useEffect(() => {
    form.reset({
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    });
    setDefaultImage(defaultValues?.image);
    setUploadedImage(null);
  }, [defaultValues, form]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadedImage(files[0]);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setDefaultImage(undefined);
  };

  const submit = (data: CategoryFormValues) => {
    const payload: CategoryFormValues = {
      ...data,
      images: uploadedImage ? [uploadedImage] : undefined,
    };
    onSubmit(payload);
    form.reset({ name: "", description: "" });
    setUploadedImage(null);
    setDefaultImage(undefined);
  };

  if (!display) return null;

  return (
    <div className="fixed z-[9999] top-0 left-0 flex w-full h-full bg-black/15 backdrop-blur-sm justify-center items-center ">
      <div className={`bg-white dark:bg-black px-4 py-3 rounded-md border border-black/10 dark:border-white/10 ${width || "min-w-[30%]"}`}>
        <div className="flex justify-between py-3">
          <h3 className="capitalize text-lg">Formulaire</h3>
          <button className="hover:opacity-50" onClick={showModal}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {parentPath && (
          <div className="mb-3 text-xs text-gray-600">
            <span className="font-medium">Parent :</span> {parentPath}
          </div>
        )}

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(submit)} className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la catégorie" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Saisir la description" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-12">
              <FormLabel>Image</FormLabel>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer p-2 border rounded-md hover:bg-primary/5 flex items-center gap-2 text-blue-500">
                  <Upload size={20} />
                  <Input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                </label>
                {(defaultImage || uploadedImage) && (
                  <div className="relative p-2 bg-gray-2 border rounded-lg">
                    <Image
                      src={uploadedImage ? URL.createObjectURL(uploadedImage) : (defaultImage as string)}
                      alt="Preview"
                      width={70}
                      height={70}
                      className="rounded-md object-cover h-10 w-auto"
                    />
                    <button type="button" className="absolute top-0 right-0 border text-primary bg-white rounded-full p-1" onClick={handleRemoveImage}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 mt-3 flex justify-end">
              <Button variant="ghost" type="submit">
                Valider
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


