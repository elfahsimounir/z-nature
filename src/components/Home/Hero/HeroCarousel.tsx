"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { formatSlug } from "@/utils/formatSlog";
import React from "react";

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

const HeroCarousal = ({data}:{data:any[]}) => {
  const isMobile = useIsMobile();
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoHeight
      observer
      observeParents
      observeSlideChildren
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
     {data? data.map((item,itemIdx)=>{
      const background = isMobile ? (item?.mobileImage || item?.image) : (item?.desktopImage || item?.image);
      return (
      <SwiperSlide key={itemIdx}>
      <div
      key={itemIdx}
      className="relative w-full min-w-[100%] h-[220px] sm:h-[320px] lg:h-[420px]">
       {/* <Link href={`/shop/${formatSlug(item.slug)}`} className="flex w-full h-full p-3 items-end ">
        <div className=" bg-white/10 h-[30%] backdrop-blur flex w-full rounded-lg justify-between px-4">
          <div className="flex flex-col p-3 gap-2 justify-center">
          <h1 className="font-medium text-gray-2 text-xl sm:text-3xl">
            <span>{item.title}</span>
          </h1>
          <p className="text-sm tracking-wider text-gray-4"> {item.description}</p>
          </div>
          <div className="flex items-center">
          <Button className="text-gray-2" variant={'default'}>Shop Now</Button>
          </div>
        </div>  
        </Link> */}
          <Link href={`/shop/${formatSlug(item.slug)}`}>
          <Image src={background} alt={item.title || "banner"} fill sizes="(min-width: 1280px) 757px, 100vw" priority={itemIdx===0} className="object-cover" />
          </Link>
        {/* <div>
               <Image
                           src={item?.image}
                           alt={item?.title}
                           width={300}
                           height={300}
                           className="hero-product-image"
                         />
        </div> */}
      </div>
    </SwiperSlide>
      )
     }):'No data yet'}

    </Swiper>
  );
};

export default HeroCarousal;
