import PublicationSwiper from "@/components/Home/Sections/PublicationSwiper";
import { prisma } from "@/lib/prisma";
import React from "react";
import ServiceGrid from "@/components/Service/ServiceGrid";

export const dynamic = "force-dynamic";

async function fetchData() {
  const services = await prisma.service.findMany({ include: { images: true } });
  const publications = await prisma.publication.findMany();
  return { services, publications };
}

export default async function ServicePage() {
  const { services, publications } = await fetchData();
  return (
    <div className=" w-full mx-auto px-4 sm:px-8 xl:px-0 py-8  sm:pt-45 lg:pt-30 xl:pt-51.5">
      <PublicationSwiper items={publications as any} title="Publications" />
      <div className="max-w-[1170px] w-full mx-auto">
      <h2 className="text-lg font-semibold mt-8 mb-4">Services</h2>
      <ServiceGrid services={services as any} />
      </div>
    </div>
  );
}

