"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
 
import "swiper/css/effect-fade";
import { formatSlug } from "@/utils/formatSlog";

type HeroSlide = {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

type PublicationItem = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  slug: string;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export default function PublicationSwiper({ items, title }: { items: (HeroSlide | PublicationItem)[]; title?: string }) {
  const isMobile = useIsMobile();
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [autoplayProgress, setAutoplayProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const announcerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Map<string, HTMLVideoElement>>(new Map());

  const slides: HeroSlide[] = React.useMemo(() => {
    return (items || []).map((it) => {
      if ((it as HeroSlide).type) return it as HeroSlide;
      const p = it as PublicationItem;
      const src = isMobile ? p.mobileImage || p.image || "" : p.desktopImage || p.image || "";
      const href = `/shop/${formatSlug(p.slug)}`;
      return {
        id: p.id,
        type: "image",
        src,
        alt: p.title,
        title: p.title,
        subtitle: p.description || undefined,
        cta: { label: "Acheter maintenant", href },
      } satisfies HeroSlide;
    }).filter((s) => s.src);
  }, [items, isMobile]);

  React.useEffect(() => {
    const handleVisibility = () => {
      const swiper = swiperRef.current;
      const activeIndex = swiper?.realIndex ?? 0;
      const activeSlide = slides[activeIndex];
      const activeVideo = activeSlide ? videoRefs.current.get(activeSlide.id) : undefined;
      if (document.hidden) {
        swiper?.autoplay?.stop();
        setIsPaused(true);
        if (activeVideo) activeVideo.pause();
      } else {
        swiper?.autoplay?.start();
        setIsPaused(false);
        if (activeVideo) {
          activeVideo.muted = true;
          activeVideo.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [slides]);

  const handleSlideChange = (swiper: SwiperType) => {
    const activeId = slides[swiper.realIndex]?.id;
    videoRefs.current.forEach((video, id) => {
      if (id === activeId) {
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
    if (announcerRef.current) {
      const s = slides[swiper.realIndex];
      announcerRef.current.textContent = s?.title || s?.alt || `Slide ${swiper.realIndex + 1}`;
    }
  };

  

  return (
    <section className="w-full overflow-hidden">
      <div className="relative group">
        <Swiper
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          onSlideChange={handleSlideChange}
          onAutoplayTimeLeft={(_, __, progress) => setAutoplayProgress(1 - progress)}
          modules={[Autoplay, EffectFade, Keyboard, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          speed={800}
          autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          keyboard={{ enabled: true }}
          a11y={{ enabled: true }}
          className="w-full h-[55vh] md:h-[70vh] xl:h-[80vh]"
          aria-label={title ? `${title} hero carousel` : "Publications hero carousel"}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} aria-roledescription="slide">
              <div className="relative w-full h-[55vh] md:h-[70vh] xl:h-[80vh]">
                {slide.type === "image" ? (
                  <Image
                    src={slide.src}
                    alt={slide.alt || slide.title || ""}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                ) : (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(slide.id, el);
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={slide.src}
                    muted
                    playsInline
                    autoPlay
                    loop
                    controls={false}
                    aria-label={slide.alt || slide.title || "Background video"}
                  />
                )}

                {/* Overlay gradient for readability */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Full-slide clickable area when CTA exists */}
                {slide.cta?.href && (
                  <Link
                    href={slide.cta.href}
                    aria-label="Open slide link"
                    className="absolute inset-0 z-10"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Timeline pagination + Pause/Play */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
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
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white border border-white hover:bg-black/70"
          >
            {isPaused ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M5 3.879v16.242L19 12 5 3.879z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z" /></svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => swiperRef.current?.slideToLoop(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 w-14 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className="absolute left-0 top-0 h-full bg-white"
                  style={{ width: `${(swiperRef.current?.realIndex === i ? autoplayProgress : 0) * 100}%` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom progress bar */}
        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-white/20">
          <div
            className="h-full bg-white"
            style={{ transform: `scaleX(${autoplayProgress})`, transformOrigin: "left" }}
            aria-hidden="true"
          />
        </div> */}

        {/* Live region for announcements */}
        <div ref={announcerRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      </div>
    </section>
  );
}


