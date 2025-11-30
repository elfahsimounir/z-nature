import type { Product } from "@/types/product";

export type Category = {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  parentId?: string | null;
  level?: number;
  parent?: Pick<Category, "id" | "name" | "slug" | "level"> | null;
  children?: Category[];
  products?: Product[]; // Optional: attached products for count display
};
