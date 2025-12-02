
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({include: { products: true } });
    return new Response(JSON.stringify(brands), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Ensure uploads bucket exists (idempotent)
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !imageFile) {
      return new Response(JSON.stringify({ error: "Name and image are required" }), { status: 400 });
    }

    // Validate the image file
    if (!(imageFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Invalid image file" }), { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "bin";
    const key = `brands/${crypto.randomUUID()}.${ext}`;

    const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
      contentType: imageFile.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadRes.error) {
      throw new Error(`Upload failed: ${uploadRes.error.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
    const publicUrl = publicUrlData.publicUrl;
    const newBrand = await prisma.brand.create({
      data: {
        name,
        image: publicUrl,
      },
    });

    return new Response(JSON.stringify(newBrand), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/brand error:", error); // Add detailed logging
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File;

    if (!id || !name) {
      return new Response(JSON.stringify({ error: "ID and name are required" }), { status: 400 });
    }

    // Fetch the current brand to retain the existing image if no new image is uploaded
    const currentBrand = await prisma.brand.findUnique({ where: { id } });
    if (!currentBrand) {
      return new Response(JSON.stringify({ error: "Brand not found" }), { status: 404 });
    }

    const data: any = { name };

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "bin";
      const key = `brands/${crypto.randomUUID()}.${ext}`;

      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: imageFile.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) {
        throw new Error(`Upload failed: ${uploadRes.error.message}`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      data.image = publicUrlData.publicUrl;
    } else {
      // Retain the current image if no new image is uploaded
      data.image = currentBrand.image;
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updatedBrand), { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/brand error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required for deletion" }), { status: 400 });
    }

    await prisma.brand.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Brand deleted successfully" }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
