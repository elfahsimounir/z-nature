import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique | zNature",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  description: "Découvrez les derniers produits tech chez zNature. Achetez ordinateurs portables, smartphones, accessoires et plus à des prix imbattables.",
  keywords: "eCommerce, boutique tech, ordinateurs portables, smartphones, gadgets, accessoires, achat en ligne",
  authors: [{ name: "Multicls" }],
  robots: "index, follow",
};

export const viewport = { width: "device-width", initialScale: 1 };
export const dynamic = "force-dynamic";

async function fetchDataFromApi(endpoint) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/${endpoint}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch /api/${endpoint}:`, res.status, res.statusText);
      throw new Error(`Failed to fetch /api/${endpoint}: ${res.statusText}`);
    }
     const data = await res.json();
    return data?data : [];
  } catch (error) {
    console.error(`Error fetching data for ${endpoint}:`, error);
    return [];
  }
}

async function fetchData() {
  const products = await fetchDataFromApi("product");
  const categorys = await fetchDataFromApi("category");
  const brands = await fetchDataFromApi("brand");
  const hashtags = await fetchDataFromApi("hashtag");
  return { products, categorys, brands, hashtags };
}



const ShopWithSidebarPage = async ({ searchParams }: { searchParams: any }) => {
  const { products,categorys,brands,hashtags } = await fetchData();

  return (
    <div className="">
      <ShopWithSidebar
        brands={brands}
       categories={categorys}
        data={products||[]}
        hashtags={hashtags}
        filters={searchParams}
        
      />
    </div>
  );
};

export default ShopWithSidebarPage;
