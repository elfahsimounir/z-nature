"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ServiceImage = { id: string; url: string };
type Service = { id: string; title: string; details?: string | null; price: number; images: ServiceImage[] };

export default function ServiceViewModal({ open, onOpenChange, service }: { open: boolean; onOpenChange: (v: boolean) => void; service: Service | null }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (open) setIndex(0);
  }, [open, service?.id]);

  const images = service?.images || [];
  const count = images.length;

  const go = (next: number) => {
    if (!count) return;
    const mod = ((next % count) + count) % count;
    setIndex(mod);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{service?.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2-per-view slider */}
          <div className="relative w-full h-64 md:h-[420px] overflow-hidden rounded-md bg-gray-100">
            {/* Track */}
            <div className="absolute inset-0 flex transition-transform duration-300" style={{ transform: `translateX(-${(index % count) * 50}%)` }}>
              {images.concat(images).map((img, i) => (
                <div key={`${img.id || img.url}-${i}`} className="relative w-1/2 h-full flex-shrink-0">
                  <Image src={img.url} alt={service?.title || "service"} fill className="object-cover" />
                </div>
              ))}
            </div>
            {count > 0 && (
              <>
                <button type="button" onClick={() => go(index - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-1 shadow" aria-label="Prev">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => go(index + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-1 shadow" aria-label="Next">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {/* details */}
          <div className="text-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold">{service?.title}</h3>
              <span className="text-base font-bold">{service?.price?.toFixed(2)} DH</span>
            </div>
            {service?.details && (
              <p className="mt-2 leading-relaxed whitespace-pre-wrap">{service.details}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


