"use client";
import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Img = { id?: string; url: string };

type Props = {
  images: Img[];
  alt: string;
  className?: string;
  autoPlayMs?: number;
};

export default function ImageCarousel({ images, alt, className, autoPlayMs = 3500 }: Props) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const count = Array.isArray(images) ? images.length : 0;

  const go = (next: number) => {
    if (count === 0) return;
    const mod = ((next % count) + count) % count;
    setIndex(mod);
  };

  React.useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => go(index + 1), autoPlayMs);
    return () => clearInterval(id);
  }, [index, paused, count, autoPlayMs]);

  if (!count) return null;

  return (
    <div
      className={`${className || ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full h-full">
        {images.map((img, i) => (
          <div
            key={img.id || `${i}-${img.url}`}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image src={img.url} alt={alt} fill className="object-cover" />
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/70 hover:bg-white p-1 shadow"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/70 hover:bg-white p-1 shadow"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-[2px] w-6 rounded-full transition-colors ${i === index ? "bg-secondary" : "bg-gray-1"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


