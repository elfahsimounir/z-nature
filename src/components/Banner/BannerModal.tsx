"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type BannerModalProps = {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string;
    desktopImage?: string | null;
    mobileImage?: string | null;
  };
  onSubmit: (data: {
    id?: string;
    title: string;
    description?: string;
    desktopImageFile?: File;
    mobileImageFile?: File;
  }) => void;
};

const BannerModal: React.FC<BannerModalProps> = ({ open, onClose, defaultValues, onSubmit }) => {
  const [title, setTitle] = React.useState(defaultValues?.title || "");
  const [description, setDescription] = React.useState(defaultValues?.description || "");
  const [desktopPreview, setDesktopPreview] = React.useState<string | null>(defaultValues?.desktopImage || null);
  const [mobilePreview, setMobilePreview] = React.useState<string | null>(defaultValues?.mobileImage || null);
  const desktopRef = React.useRef<HTMLInputElement | null>(null);
  const mobileRef = React.useRef<HTMLInputElement | null>(null);
  const desktopFileRef = React.useRef<File | undefined>(undefined);
  const mobileFileRef = React.useRef<File | undefined>(undefined);

  React.useEffect(() => {
    setTitle(defaultValues?.title || "");
    setDescription(defaultValues?.description || "");
    setDesktopPreview(defaultValues?.desktopImage || null);
    setMobilePreview(defaultValues?.mobileImage || null);
  }, [defaultValues]);

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    desktopFileRef.current = file || undefined;
    if (file) setDesktopPreview(URL.createObjectURL(file));
  };
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    mobileFileRef.current = file || undefined;
    if (file) setMobilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: defaultValues?.id,
      title,
      description,
      desktopImageFile: desktopFileRef.current,
      mobileImageFile: mobileFileRef.current,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed z-[9999] top-0 left-0 flex w-full h-full bg-black/15 backdrop-blur-sm justify-center items-center">
      <div className="bg-white dark:bg-black px-4 py-3 rounded-md border border-black/10 dark:border-white/10 min-w-[30%]">
        <div className="flex justify-between py-3">
          <h3 className="capitalize text-lg">Banner</h3>
          <button className="hover:opacity-50" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2">
          <div className="col-span-12">
            <label className="block text-sm mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter banner title" />
          </div>
          <div className="col-span-12">
            <label className="block text-sm mb-1">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm mb-1">Desktop image</label>
              <Input ref={desktopRef} type="file" accept="image/*" onChange={handleDesktopChange} />
              {desktopPreview && (
                <div className="mt-2">
                  <Image src={desktopPreview} alt="desktop" width={160} height={90} className="w-auto h-24 object-cover" />
                </div>
              )}
            </div>
            <div className="col-span-6">
              <label className="block text-sm mb-1">Mobile image</label>
              <Input ref={mobileRef} type="file" accept="image/*" onChange={handleMobileChange} />
              {mobilePreview && (
                <div className="mt-2">
                  <Image src={mobilePreview} alt="mobile" width={120} height={160} className="w-auto h-24 object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 mt-3 flex justify-end">
            <Button variant="ghost" type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerModal;


