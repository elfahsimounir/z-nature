
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import slugify from "slugify";

// Ensure slug uniqueness by appending incremental suffix when needed
async function generateUniqueCategorySlug(baseSlug: string, excludeId?: string): Promise<string> {
  const existing = await prisma.category.findMany({
    select: { id: true, slug: true },
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  const existingSet = new Set(existing.map((c) => c.slug));
  if (!existingSet.has(baseSlug)) return baseSlug;
  let counter = 1;
  let candidate = `${baseSlug}-${counter}`;
  while (existingSet.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
        parent: { select: { id: true, name: true, slug: true, level: true } },
        children: true,
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });
    // Aggregate product counts to include all descendants
    const byId = new Map<string, any>();
    const childrenMap = new Map<string, any[]>();
    for (const c of categories as any[]) {
      byId.set(c.id, c);
      if (c.parentId) {
        const arr = childrenMap.get(c.parentId) || [];
        arr.push(c);
        childrenMap.set(c.parentId, arr);
      }
    }

    const memo = new Map<string, number>();
    const countTotal = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!;
      const node = byId.get(id);
      if (!node) return 0;
      let total = Array.isArray(node.products) ? node.products.length : 0;
      const kids = childrenMap.get(id) || [];
      for (const k of kids) {
        total += countTotal(k.id);
      }
      memo.set(id, total);
      return total;
    };

    const enriched = (categories as any[]).map((c) => ({
      ...c,
      totalProducts: countTotal(c.id),
    }));

    return new Response(JSON.stringify(enriched), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    const parentId = (formData.get("parentId") as string) || null;

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    const slug = await generateUniqueCategorySlug(baseSlug);

    let imagePath: string | null = null;
    if (imageFile && imageFile instanceof File) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      imagePath = path.join(uploadsDir, imageFile.name);
      await fs.writeFile(imagePath, new Uint8Array(await imageFile.arrayBuffer()));
      imagePath = `/uploads/${imageFile.name}`;
    }

    // determine level (max depth 3)
    let level = 1;
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return new Response(JSON.stringify({ error: "Parent category not found" }), { status: 400 });
      }
      if ((parent as any).level >= 3) {
        return new Response(JSON.stringify({ error: "Cannot add child to a level-3 category" }), { status: 400 });
      }
      level = (parent as any).level + 1;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || "",
        image: imagePath,
        parentId: parentId || undefined,
        level,
      },
      include: { products: true, parent: true, children: true },
    });

    return new Response(JSON.stringify(newCategory), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/category error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    const parentId = (formData.get("parentId") as string) || null;

    if (!id || !name) {
      return new Response(JSON.stringify({ error: "ID and name are required" }), { status: 400 });
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    const slug = await generateUniqueCategorySlug(baseSlug, id);

    const currentCategory = await prisma.category.findUnique({ where: { id } });
    if (!currentCategory) {
      return new Response(JSON.stringify({ error: "Category not found" }), { status: 404 });
    }

    // prevent cycles and enforce max depth 3
    if (parentId === id) {
      return new Response(JSON.stringify({ error: "A category cannot be its own parent" }), { status: 400 });
    }
    let level = (currentCategory as any).level || 1;
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return new Response(JSON.stringify({ error: "Parent category not found" }), { status: 400 });
      }
      if ((parent as any).level >= 3) {
        return new Response(JSON.stringify({ error: "Cannot set a level-3 category as parent" }), { status: 400 });
      }
      level = (parent as any).level + 1;
      // ensure we're not assigning a descendant as parent (simple check using ancestor chain)
      const descendants = await prisma.category.findMany({ where: { parentId: id }, select: { id: true } });
      if (descendants.some(d => d.id === parentId)) {
        return new Response(JSON.stringify({ error: "Cannot set a child as parent" }), { status: 400 });
      }
    } else {
      level = 1;
    }

    let imagePath = currentCategory.image;
    if (imageFile && imageFile instanceof File) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      imagePath = path.join(uploadsDir, imageFile.name);
      await fs.writeFile(imagePath, new Uint8Array(await imageFile.arrayBuffer()));
      imagePath = `/uploads/${imageFile.name}`;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || "",
        image: imagePath,
        parentId: parentId || null,
        level,
      },
      include: { products: true, parent: true, children: true },
    });

    return new Response(JSON.stringify(updatedCategory), { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/category error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll("id");

    if (!ids.length) {
      return new Response(JSON.stringify({ error: "No IDs provided for deletion" }), { status: 400 });
    }

    // fetch all categories once to compute descendant graph
    const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
    const idSet = new Set<string>();

    const childrenMap = new Map<string, string[]>();
    for (const c of all) {
      if (!c.parentId) continue;
      const arr = childrenMap.get(c.parentId) || [];
      arr.push(c.id);
      childrenMap.set(c.parentId, arr);
    }

    const collectDescendants = (rootId: string) => {
      const stack = [rootId];
      while (stack.length) {
        const current = stack.pop() as string;
        if (idSet.has(current)) continue;
        idSet.add(current);
        const kids = childrenMap.get(current) || [];
        for (const k of kids) stack.push(k);
      }
    };

    ids.forEach((id) => collectDescendants(id));

    if (idSet.size === 0) {
      return new Response(JSON.stringify({ error: "No matching categories found" }), { status: 404 });
    }

    // Delete children first is not necessary with deleteMany, but safe anyway
    await prisma.category.deleteMany({ where: { id: { in: Array.from(idSet) } } });

    return new Response(
      JSON.stringify({ message: "Catégories supprimées avec succès", deletedCount: idSet.size }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/category error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}
