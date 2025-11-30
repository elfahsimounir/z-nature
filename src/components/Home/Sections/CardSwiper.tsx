"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatSlug } from "@/utils/formatSlog";
import SectionHeader from "@/components/Common/SectionHeader";

type Item = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  slug: string;
};

export default function CardSwiper({
  items,
  title,
  icon,
  slidesPerViewLg,
}: {
  items: Item[];
  title: string;
  icon: React.ReactNode;
  slidesPerViewLg: number; // 3 for offers/promotions, 2 for publications
}) {
  const isMobile = typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false;

  const swiperRef = React.useRef<SwiperType | null>(null);
  const [currentSpv, setCurrentSpv] = React.useState<number>(1);
  const [activePage, setActivePage] = React.useState<number>(0);
  const [autoplayProgress, setAutoplayProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  // Track slidesPerView with breakpoints to compute pages
  React.useEffect(() => {
    const mq640 = window.matchMedia("(min-width: 640px)");
    const mq1024 = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      const spv = mq1024.matches
        ? slidesPerViewLg
        : mq640.matches
        ? Math.min(2, slidesPerViewLg)
        : 1;
      setCurrentSpv(spv);
      const idx = swiperRef.current?.realIndex || 0;
      setActivePage(Math.floor(idx / spv));
    };
    update();
    mq640.addEventListener("change", update);
    mq1024.addEventListener("change", update);
    return () => {
      mq640.removeEventListener("change", update);
      mq1024.removeEventListener("change", update);
    };
  }, [slidesPerViewLg]);

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / (currentSpv || 1)));

  const updateNavState = (s: SwiperType, spv: number) => {
    const page = Math.floor((s.realIndex || 0) / (spv || 1));
    setActivePage(page);
    // Prefer Swiper edge flags when available for reliability
    if (typeof s.isBeginning === "boolean" && typeof s.isEnd === "boolean") {
      setCanPrev(!s.isBeginning);
      setCanNext(!s.isEnd);
    } else {
      setCanPrev(page > 0);
      setCanNext(page < Math.max(0, Math.ceil((items?.length || 0) / (spv || 1)) - 1));
    }
  };

  return (
    <section className="overflow-hidden py-8 ">
      <div className=" w-full mx-auto sm:px-8 xl:px-0">
        <SectionHeader
          title={title}
          description={''}
          icon={icon}
          /> 
        <div className="relative group">
          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
              updateNavState(s, currentSpv || 1);
            }}
            onInit={(s) => updateNavState(s, currentSpv || 1)}
            onResize={(s) => updateNavState(s, currentSpv || 1)}
            onSlideChange={(s) => updateNavState(s, currentSpv || 1)}
            onReachBeginning={(s) => updateNavState(s, currentSpv || 1)}
            onReachEnd={(s) => updateNavState(s, currentSpv || 1)}
            onAutoplayTimeLeft={(_, __, progress) => setAutoplayProgress(1 - progress)}
            spaceBetween={16}
            autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            modules={[Autoplay, Keyboard, A11y]}
            keyboard={{ enabled: true }}
            a11y={{ enabled: true }}
            breakpoints={{
              0: { slidesPerView: 1, slidesPerGroup: 1 },
              640: { slidesPerView: Math.min(2, slidesPerViewLg), slidesPerGroup: Math.min(2, slidesPerViewLg) },
              1024: { slidesPerView: slidesPerViewLg, slidesPerGroup: slidesPerViewLg },
            }}
            loop={false}
          >
          {(items || []).map((item, idx) => {
            const img = isMobile ? item.mobileImage || item.image : item.desktopImage || item.image;
            return (
              <SwiperSlide key={item.id || idx}>
                <Link href={`/shop/${formatSlug(item.slug)}`} className="block">
                  <div className="bg-white  overflow-hidden">
                    <div className="relative w-full pb-[100%]">{/* square */}
                      {img && (
                        <Image src={img} alt={item.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="absolute inset-0 object-cover" />
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
          </Swiper>

          {/* Smart Prev/Next */}
          <button
            aria-label="Previous"
            onClick={() => swiperRef.current?.slideTo(Math.max(0, (activePage - 1) * (currentSpv || 1)))}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border border-white text-white shadow-md transition ${
              canPrev ? "bg-black/50 hover:bg-black/70 opacity-100" : "bg-black/20 opacity-0 pointer-events-none"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 010 1.06L9.06 12l6.72 6.72a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={() => swiperRef.current?.slideTo(Math.min(items.length - 1, (activePage + 1) * (currentSpv || 1)))}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border border-white text-white shadow-md transition ${
              canNext ? "bg-black/50 hover:bg-black/70 opacity-100" : "bg-black/20 opacity-0 pointer-events-none"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M8.22 19.78a.75.75 0 010-1.06L14.94 12 8.22 5.28a.75.75 0 111.06-1.06l7.25 7.25a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Timeline pagination + Pause/Play */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            <button
              onClick={() => {
                const s = swiperRef.current;
                if (!s) return;
                if (isPaused) {
                  s.autoplay.start();
                  setIsPaused(false);
                } else {
                  s.autoplay.stop();
                  setIsPaused(true);
                }
              }}
              aria-label={isPaused ? "Play" : "Pause"}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white border border-white hover:bg-black/70"
            >
              {isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M5 3.879v16.242L19 12 5 3.879z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z" /></svg>
              )}
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => swiperRef.current?.slideTo(i * (currentSpv || 1))}
                  aria-label={`Go to page ${i + 1}`}
                  className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/30"
                >
                  <span
                    className="absolute left-0 top-0 h-full bg-white"
                    style={{ width: `${(activePage === i ? autoplayProgress : 0) * 100}%` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


