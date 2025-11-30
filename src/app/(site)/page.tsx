import Newsletter from "@/components/Common/Newsletter";
import BestSeller from "@/components/Home/BestSeller";
import Categories from "@/components/Home/Categories";
import Hero from "@/components/Home/Hero";
import NewArrival from "@/components/Home/NewArrivals";
import PromoBanner from "@/components/Home/PromoBanner";
import CardSwiper from "@/components/Home/Sections/CardSwiper";
import PublicationSwiper from "@/components/Home/Sections/PublicationSwiper";
import ServicesSwiper from "@/components/Home/Sections/ServicesSwiper";
import { Blend, Gem, Gift, Ribbon, Tag } from "lucide-react";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "znature | Accueil",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  description: "Découvrez les derniers produits tech chez Multishop. Achetez ordinateurs portables, smartphones, accessoires et plus à des prix imbattables.",
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

    return await res.json();
  } catch (error) {
    console.error(`Error fetching data for ${endpoint}:`, error);
    return [];
  }
}

async function fetchData() {

  const allproducts = await fetchDataFromApi("product");
  const categorys = await fetchDataFromApi("category");
  const brands = await fetchDataFromApi("brand");
  const hashtags = await fetchDataFromApi("hashtag");
  const banners = await fetchDataFromApi("banner");
  const promotions = await fetchDataFromApi("promotion");
  const offers = await fetchDataFromApi("offer");
  const publications = await fetchDataFromApi("publication");
  const services = await fetchDataFromApi("service");

  const neWproducts = allproducts
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 12);

  const randomProducts = allproducts
    .sort(() => 0.5 - Math.random()) // Shuffle the array
    .slice(0, 12); // Select the first 9 products

  // Implement logic to get 2 products that have the highest reduction (price - discount) / price
  const highestReduction = allproducts
    .filter(product => product.price && product.discount) // Ensure price and discount exist
    .sort((a, b) => ((b.price - b.discount) / b.price) - ((a.price - a.discount) / a.price))
    .slice(0, 2);

  const products = {
    new: neWproducts,
    random: randomProducts,
    offers: highestReduction,
  }


  return { products, categorys, brands, hashtags, banners, promotions, offers, publications, services };
}


export default async function HomePage() {
  const { products, categorys, brands, hashtags, banners, promotions, offers, publications, services } = await fetchData();

  return (
    <>
      <Hero
        data={{
          products: products.offers,
          banners,
        }}
      />

      <Categories
        qOption={'category'}
        header={{
          title: "Catégories",
          description: "Parcourir par Catégorie",
          icon: <Ribbon strokeWidth={1.5} size={18} />
        }}
        data={categorys} />
      <div className="max-w-[1170px] mx-auto p-1">
      <CardSwiper icon={<Gem strokeWidth={1.5} size={18} />} title="Promotions" items={promotions} slidesPerViewLg={3} />
      </div>
      <NewArrival data={products.new} />
      <div className=" my-10">
      <PublicationSwiper title="Publications" items={publications} />
      </div>
      <div className="max-w-[1170px] mx-auto">
        <ServicesSwiper icon={<Blend strokeWidth={1.5} size={18} />} title="Services" items={services || []} />
      </div>
      <BestSeller data={products.random} />
      {/* <CounDown /> */}
      <div className="max-w-[1170px] mx-auto">
     <CardSwiper icon={<Gift strokeWidth={1.5} size={18} />} title="Offres" items={offers} slidesPerViewLg={3} />
     </div>


    
      <Categories
        qOption={'brand'}
        header={{
          title: "Les Marques",
          description: "Parcourir par Marque",
          icon: <Tag strokeWidth={1.5} size={18} />
        }}
        data={brands} />
      {/* <Testimonials /> */}
      <PromoBanner />
      <Newsletter />
    </>
  );
}
