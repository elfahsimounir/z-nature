export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

async function generateUniqueSlugForBanner(desired: string, currentId?: string) {
  let slug = desired;
  let i = 1;
  while (true) {
    const existing = await prisma.banner.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${desired}-${i++}`;
  }
}

export async function GET(req: Request) {
  try {
    const banners = await prisma.banner.findMany();
    return new Response(JSON.stringify(banners), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/banner error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null; // legacy single image support
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    const productId = formData.get("productId") as string;

    // Require new desktop/mobile images for creation; allow legacy single image only for backward compatibility
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
      // If only legacy provided, use it for both to satisfy min two images requirement visually
      if (!savedDesktopImage) savedDesktopImage = savedLegacyImage;
      if (!savedMobileImage) savedMobileImage = savedLegacyImage;
    }

    const slug = await generateUniqueSlugForBanner(product.slug);
    const newBanner = await prisma.banner.create({
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

    return new Response(JSON.stringify(newBanner), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/banner error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null; // legacy support
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    const productId = formData.get("productId") as string;

    if (!id || !productId) {
      return new Response(JSON.stringify({ error: "Banner ID and product are required for updating" }), { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return new Response(JSON.stringify({ error: "Invalid product selected" }), { status: 400 });
    }

    const currentBanner = await prisma.banner.findUnique({ where: { id } });
    if (!currentBanner) {
      return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 });
    }

    const desired = product.slug;
    const slug = await generateUniqueSlugForBanner(desired, id);
    const data: any = { title, description, slug, productId };

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    if (desktopImageFile && desktopImageFile.size > 0) {
      const desktopPath = path.join(uploadsDir, desktopImageFile.name);
      await fs.writeFile(desktopPath, new Uint8Array(await desktopImageFile.arrayBuffer()));
      data.desktopImage = `/uploads/${desktopImageFile.name}`;
      // keep legacy image in sync with desktop image for backward use
      data.image = data.desktopImage;
    }
    if (mobileImageFile && mobileImageFile.size > 0) {
      const mobilePath = path.join(uploadsDir, mobileImageFile.name);
      await fs.writeFile(mobilePath, new Uint8Array(await mobileImageFile.arrayBuffer()));
      data.mobileImage = `/uploads/${mobileImageFile.name}`;
    }
    if (imageFile && imageFile.size > 0) {
      const legacyPath = path.join(uploadsDir, imageFile.name);
      await fs.writeFile(legacyPath, new Uint8Array(await imageFile.arrayBuffer()));
      data.image = `/uploads/${imageFile.name}`;
      // If desktop/mobile not provided in this update, we can optionally sync desktop to legacy
      if (!data.desktopImage) data.desktopImage = data.image;
      if (!data.mobileImage) data.mobileImage = currentBanner.mobileImage || data.image;
    }
    if (!imageFile && !desktopImageFile && !mobileImageFile) {
      data.image = currentBanner.image;
      data.desktopImage = currentBanner.desktopImage;
      data.mobileImage = currentBanner.mobileImage;
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updatedBanner), { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/banner error:", error);
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

    await prisma.banner.deleteMany({
      where: { id: { in: ids } },
    });

    return new Response(JSON.stringify({ message: 'Banners deleted successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/banner error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
  }
}
