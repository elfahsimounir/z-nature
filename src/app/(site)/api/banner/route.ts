export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

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
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});

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

    let savedDesktopImage: string | null = null;
    let savedMobileImage: string | null = null;
    let savedLegacyImage: string | null = null;

    if (desktopImageFile) {
      const bytes = await desktopImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = desktopImageFile.name.includes(".") ? desktopImageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: desktopImageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Desktop upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      savedDesktopImage = publicUrlData.publicUrl;
    }
    if (mobileImageFile) {
      const bytes = await mobileImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = mobileImageFile.name.includes(".") ? mobileImageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: mobileImageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Mobile upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      savedMobileImage = publicUrlData.publicUrl;
    }
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Legacy upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      savedLegacyImage = publicUrlData.publicUrl;
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
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});

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

    if (desktopImageFile && desktopImageFile.size > 0) {
      const bytes = await desktopImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = desktopImageFile.name.includes(".") ? desktopImageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: desktopImageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Desktop upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      data.desktopImage = publicUrlData.publicUrl;
      data.image = data.desktopImage;
    }
    if (mobileImageFile && mobileImageFile.size > 0) {
      const bytes = await mobileImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = mobileImageFile.name.includes(".") ? mobileImageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: mobileImageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Mobile upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      data.mobileImage = publicUrlData.publicUrl;
    }
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "bin";
      const key = `banners/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Legacy upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      data.image = publicUrlData.publicUrl;
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
