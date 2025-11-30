"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";

type ServiceValues = {
  id?: string;
  title: string;
  details?: string;
  price: number;
  reviews?: number;
  images?: { url: string }[] | string[] | File[];
};

export default function ServiceModal({ open, onClose, defaultValues, onSuccess }: {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<ServiceValues>;
  onSuccess: () => void;
}) {
  const [title, setTitle] = React.useState(defaultValues?.title || "");
  const [details, setDetails] = React.useState(defaultValues?.details || "");
  const [price, setPrice] = React.useState<string>(defaultValues?.price?.toString() || "");
  const [reviews, setReviews] = React.useState<string>(defaultValues?.reviews?.toString() || "0");
  const [uploadedImages, setUploadedImages] = React.useState<File[]>([]);
  const [defaultImageUrls, setDefaultImageUrls] = React.useState<string[]>([]);
  const originalDefaultUrlsRef = React.useRef<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle(defaultValues?.title || "");
      setDetails(defaultValues?.details || "");
      setPrice(defaultValues?.price?.toString() || "");
      setReviews(defaultValues?.reviews?.toString() || "0");
      setUploadedImages([]);
      const urls: string[] = Array.isArray(defaultValues?.images)
        ? (defaultValues!.images as any[]).map((img: any) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
        : [];
      setDefaultImageUrls(urls);
      originalDefaultUrlsRef.current = urls;
    }
  }, [open, defaultValues?.id]);

  const handleSubmit = async () => {
    const method = defaultValues?.id ? "PUT" : "POST";
    const fd = new FormData();
    if (defaultValues?.id) fd.append("id", defaultValues.id);
    fd.append("title", title);
    fd.append("details", details);
    fd.append("price", price || "0");
    fd.append("reviews", reviews || "0");
    uploadedImages.slice(0, 3 - defaultImageUrls.length).forEach((file) => fd.append("images", file));
    const toDelete = originalDefaultUrlsRef.current.filter((u) => !defaultImageUrls.includes(u));
    toDelete.forEach((url) => fd.append("deleteImages", url));
    try {
      setLoading(true);
      const res = await fetch("/api/service", { method, body: fd });
      if (!res.ok) throw new Error("Failed to save service");
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues?.id ? "Modifier le service" : "Créer un service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Titre</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du service" />
          </div>
          <div>
            <label className="text-sm">Détails</label>
            <Input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Brève description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Prix</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm">Avis</label>
              <Input value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="text-sm">Images (jusqu'à 3)</label>
            <div className="flex w-full gap-4 items-center">
              {defaultImageUrls.length + uploadedImages.length < 3 && (
                <div className="flex items-center mt-2">
                  <label className="cursor-pointer p-2 border rounded-md hover:bg-primary/5 flex items-center gap-2 text-blue-500">
                    <Upload size={20} />
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const allowed = 3 - defaultImageUrls.length - uploadedImages.length;
                        if (allowed > 0) setUploadedImages((prev) => [...prev, ...files.slice(0, allowed)]);
                      }}
                    />
                  </label>
                </div>
              )}
              {/* Existing Images */}
              {defaultImageUrls.map((url, index) => (
                <div key={index} className="relative p-2 bg-gray-2 border rounded-lg">
                  <Image src={url} alt={`Image ${index + 1}`} width={70} height={70} className="rounded-md object-cover h-10 w-auto" />
                  <button type="button" className="absolute top-0 right-0 border text-primary bg-white rounded-full p-1" onClick={() => setDefaultImageUrls((prev) => prev.filter((u) => u !== url))}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {/* New Uploads */}
              <div className="border-l px-3 flex gap-1 overflow-x-auto w-full">
                <div className="flex gap-2 p-2 bg-gray-2 border rounded-lg">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative flex">
                      <Image src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} width={70} height={70} className="rounded-md object-cover h-auto w-20" />
                      <button type="button" className="absolute top-0 right-0 text-primary bg-white rounded-full p-1" onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== index))}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!title || !price || loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


