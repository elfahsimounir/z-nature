"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import Image from "next/image";
import ImageCarousel from "@/components/ui/ImageCarousel";
import React from "react";
import { Button } from "@/components/ui/button";
import ReservationModal from "@/components/ui/ReservationModal";
import SectionHeader from "@/components/Common/SectionHeader";

type Service = {
  id: string;
  title: string;
  icon: React.ReactNode;
  details?: string | null;
  price: number;
  images: { id: string; url: string }[];
};

export default function ServicesSwiper({ items, title, icon }: { items: Service[], title: string, icon: React.ReactNode }) {
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [active, setActive] = React.useState(0);
  const [spv, setSpv] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Service | null>(null);

  React.useEffect(() => {
    const mq640 = window.matchMedia("(min-width: 640px)");
    const mq1024 = window.matchMedia("(min-width: 1024px)");
    const update = () => setSpv(mq1024.matches ? 3 : mq640.matches ? 2 : 1);
    update();
    mq640.addEventListener("change", update);
    mq1024.addEventListener("change", update);
    return () => {
      mq640.removeEventListener("change", update);
      mq1024.removeEventListener("change", update);
    };
  }, []);

  return (
    <section className="overflow-hidden py-8">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative">
          <SectionHeader
          title={title}
          description={''}
          icon={icon}
          /> 
          <Swiper
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => setActive(s.realIndex)}
            modules={[Keyboard, A11y]}
            keyboard={{ enabled: true }}
            a11y={{ enabled: true }}
            breakpoints={{
              0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
            }}
          >
            {items.map((svc) => (
              <SwiperSlide key={svc.id}>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="relative w-full pb-[100%]">
                    <ImageCarousel images={svc.images} alt={svc.title} className="absolute inset-0" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold line-clamp-2">{svc.title}</h4>
                      <span className="text-sm font-bold">{svc.price.toFixed(2)} DH</span>
                    </div>
                    {svc.details && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{svc.details}</p>}
                    <div className="mt-3">
                      <Button size="sm" onClick={() => { setSelected(svc); setOpen(true); }} aria-label={`Reserve ${svc.title}`}>
                        Reserve
                      </Button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <ReservationModal open={open} onOpenChange={setOpen} service={selected ? { id: selected.id, title: selected.title } : null} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {Array.from({ length: Math.max(1, Math.ceil(items.length / spv)) }).map((_, i) => (
              <button
                key={i}
                onClick={() => swiperRef.current?.slideTo(i * spv)}
                className={`h-1.5 w-10 rounded-full ${i === Math.floor(active / spv) ? "bg-blue" : "bg-gray-300"}`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


