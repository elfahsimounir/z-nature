export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

async function generateUniqueSlugForPublication(desired: string, currentId?: string) {
  let slug = desired;
  let i = 1;
  while (true) {
    const existing = await prisma.publication.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${desired}-${i++}`;
  }
}

export async function GET(req: Request) {
  try {
    const result = await prisma.publication.findMany();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/publication error:', error);
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
        return new Response(JSON.stringify({ error: "Desktop and mobile images are required" }), { status: 400 });
      }
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return new Response(JSON.stringify({ error: "Invalid product selected" }), { status: 400 });
    }

    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});
    let savedDesktopImage: string | null = null;
    let savedMobileImage: string | null = null;
    let savedLegacyImage: string | null = null;
    if (desktopImageFile) {
      const bytes = await desktopImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = desktopImageFile.name.includes(".") ? desktopImageFile.name.split(".").pop() : "bin";
      const key = `publications/${crypto.randomUUID()}.${ext}`;
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
      const key = `publications/${crypto.randomUUID()}.${ext}`;
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
      const key = `publications/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Legacy upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      savedLegacyImage = publicUrlData.publicUrl;
      if (!savedDesktopImage) savedDesktopImage = savedLegacyImage;
      if (!savedMobileImage) savedMobileImage = savedLegacyImage;
    }
    const slug = await generateUniqueSlugForPublication(product.slug);
    const created = await prisma.publication.create({
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
    console.error("POST /api/publication error:", error);
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
    const current = await prisma.publication.findUnique({ where: { id } });
    if (!current) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    const desired = product.slug;
    const slug = await generateUniqueSlugForPublication(desired, id);
    const data: any = { title, description, slug, productId };
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});
    if (desktopImageFile && desktopImageFile.size > 0) {
      const bytes = await desktopImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = desktopImageFile.name.includes(".") ? desktopImageFile.name.split(".").pop() : "bin";
      const key = `publications/${crypto.randomUUID()}.${ext}`;
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
      const key = `publications/${crypto.randomUUID()}.${ext}`;
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
      const key = `publications/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Legacy upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      data.image = publicUrlData.publicUrl;
      if (!data.desktopImage) data.desktopImage = data.image;
      if (!data.mobileImage) data.mobileImage = current.mobileImage || data.image;
    }
    if (!imageFile && !desktopImageFile && !mobileImageFile) {
      data.image = current.image;
      data.desktopImage = current.desktopImage;
      data.mobileImage = current.mobileImage;
    }
    const updated = await prisma.publication.update({ where: { id }, data });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/publication error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll('id');
    if (!ids.length) return new Response(JSON.stringify({ error: 'No IDs provided' }), { status: 400 });
    await prisma.publication.deleteMany({ where: { id: { in: ids } } });
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/publication error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), { status: 500 });
  }
}


