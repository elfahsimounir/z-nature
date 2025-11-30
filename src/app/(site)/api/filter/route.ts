export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priceMin = parseFloat(searchParams.get("price_min") || "0");
    const priceMaxParam = searchParams.get("price_max");
    const priceMax = priceMaxParam ? parseFloat(priceMaxParam) : undefined; // Ensure priceMax is a valid number or undefined
    const hashtags = searchParams.get("hashtags")?.split(",") || [];
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort"); // new, old, famous

    // If a top-level category is selected, include all descendants in the filter
    let categoryWhere: any = undefined;
    if (category) {
      const allCategories = await prisma.category.findMany({
        select: { id: true, name: true, parentId: true },
      });
      const target = allCategories.find((c) => c.name === category);
      if (target) {
        const byParent = new Map<string, { id: string; name: string; parentId: string | null }[]>();
        for (const c of allCategories) {
          if (!c.parentId) continue;
          const arr = byParent.get(c.parentId) || [];
          arr.push(c);
          byParent.set(c.parentId, arr);
        }
        const nameSet = new Set<string>();
        const stack = [target];
        let guard = 0;
        while (stack.length && guard < 1000) {
          guard++;
          const cur = stack.pop()!;
          nameSet.add(cur.name);
          const kids = byParent.get(cur.id) || [];
          for (const k of kids) stack.push(k);
        }
        categoryWhere = { category: { name: { in: Array.from(nameSet) } } };
      } else {
        categoryWhere = { category: { name: category } };
      }
    }

    const products = await prisma.product.findMany({
      where: {
        ...(categoryWhere || {}),
        price: {
          gte: priceMin,
          ...(priceMax !== undefined && { lte: priceMax }), // Only include lte if priceMax is defined
        },
        ...(hashtags.length > 0 && {
          hashtags: { some: { name: { in: hashtags } } },
        }),
        ...(brand && { brand: { name: brand } }),
      },
      include: {
        images: true,
        category: true,
        brand: true,
        hashtags: true,
        reviews: true,
      },
      orderBy: {
        ...(sort === "new" && { createdAt: "desc" }),
        ...(sort === "old" && { createdAt: "asc" }),
        ...(sort === "famous" && { reviews: { _count: "desc" } }),
      },
    });

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error: any) {
    console.error("GET /api/filter error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500 }
    );
  }
}
