export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

async function generateUniqueSlugForPromotion(desired: string, currentId?: string) {
  let slug = desired;
  let i = 1;
  while (true) {
    const existing = await prisma.promotion.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${desired}-${i++}`;
  }
}

export async function GET(req: Request) {
  try {
    const promotions = await prisma.promotion.findMany();
    return new Response(JSON.stringify(promotions), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/promotion error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    const productId = formData.get("productId") as string;

    if (!title || !productId) {
      return new Response(JSON.stringify({ error: "Title and product are required" }), { status: 400 });
    }

    if (!desktopImageFile || !mobileImageFile) {
      if (!imageFile) {
        return new Response(
          JSON.stringify({ error: "Desktop and mobile images are required" }),
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return new Response(JSON.stringify({ error: "Invalid product selected" }), { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    let savedDesktopImage: string | null = null;
    let savedMobileImage: string | null = null;
    let savedLegacyImage: string | null = null;

    if (desktopImageFile) {
      const desktopPath = path.join(uploadsDir, desktopImageFile.name);
      await fs.writeFile(desktopPath, new Uint8Array(await desktopImageFile.arrayBuffer()));
      savedDesktopImage = `/uploads/${desktopImageFile.name}`;
    }
    if (mobileImageFile) {
      const mobilePath = path.join(uploadsDir, mobileImageFile.name);
      await fs.writeFile(mobilePath, new Uint8Array(await mobileImageFile.arrayBuffer()));
      savedMobileImage = `/uploads/${mobileImageFile.name}`;
    }
    if (imageFile) {
      const imagePath = path.join(uploadsDir, imageFile.name);
      await fs.writeFile(imagePath, new Uint8Array(await imageFile.arrayBuffer()));
      savedLegacyImage = `/uploads/${imageFile.name}`;
      if (!savedDesktopImage) savedDesktopImage = savedLegacyImage;
      if (!savedMobileImage) savedMobileImage = savedLegacyImage;
    }

    const slug = await generateUniqueSlugForPromotion(product.slug);
    const created = await prisma.promotion.create({
      data: {
        title,
        description: description || "",
        image: savedDesktopImage || savedLegacyImage || "",
        desktopImage: savedDesktopImage,
        mobileImage: savedMobileImage,
        slug,
        productId,
      },
    });

    return new Response(JSON.stringify(created), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/promotion error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    const productId = formData.get("productId") as string;

    if (!id || !productId) {
      return new Response(JSON.stringify({ error: "ID and product are required" }), { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return new Response(JSON.stringify({ error: "Invalid product selected" }), { status: 400 });
    }
    const current = await prisma.promotion.findUnique({ where: { id } });
    if (!current) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const desired = product.slug;
    const slug = await generateUniqueSlugForPromotion(desired, id);
    const data: any = { title, description, slug, productId };
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    if (desktopImageFile && desktopImageFile.size > 0) {
      const p = path.join(uploadsDir, desktopImageFile.name);
      await fs.writeFile(p, new Uint8Array(await desktopImageFile.arrayBuffer()));
      data.desktopImage = `/uploads/${desktopImageFile.name}`;
      data.image = data.desktopImage;
    }
    if (mobileImageFile && mobileImageFile.size > 0) {
      const p = path.join(uploadsDir, mobileImageFile.name);
      await fs.writeFile(p, new Uint8Array(await mobileImageFile.arrayBuffer()));
      data.mobileImage = `/uploads/${mobileImageFile.name}`;
    }
    if (imageFile && imageFile.size > 0) {
      const p = path.join(uploadsDir, imageFile.name);
      await fs.writeFile(p, new Uint8Array(await imageFile.arrayBuffer()));
      data.image = `/uploads/${imageFile.name}`;
      if (!data.desktopImage) data.desktopImage = data.image;
      if (!data.mobileImage) data.mobileImage = current.mobileImage || data.image;
    }
    if (!imageFile && !desktopImageFile && !mobileImageFile) {
      data.image = current.image;
      data.desktopImage = current.desktopImage;
      data.mobileImage = current.mobileImage;
    }

    const updated = await prisma.promotion.update({ where: { id }, data });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/promotion error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll('id');
    if (!ids.length) {
      return new Response(JSON.stringify({ error: 'No IDs provided for deletion' }), { status: 400 });
    }
    await prisma.promotion.deleteMany({ where: { id: { in: ids } } });
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/promotion error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
  }
}


