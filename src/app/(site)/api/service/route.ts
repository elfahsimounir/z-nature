export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function GET() {
  try {
    const services = await prisma.service.findMany({ include: { images: true } });
    return new Response(JSON.stringify(services), { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string) || "";
    const details = (formData.get("details") as string) || "";
    const price = parseFloat((formData.get("price") as string) || "0");
    const reviews = parseInt((formData.get("reviews") as string) || "0");
    const imageFiles = formData.getAll("images") as File[];
    if (!title || isNaN(price)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});
    const imagePaths: string[] = [];
    for (const file of imageFiles.slice(0, 3)) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const key = `services/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      imagePaths.push(publicUrlData.publicUrl);
    }
    const service = await prisma.service.create({
      data: {
        title,
        details,
        price,
        reviews,
        images: { create: imagePaths.map((url) => ({ url })) },
      },
      include: { images: true },
    });
    return new Response(JSON.stringify(service), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = (formData.get("title") as string) || undefined;
    const details = (formData.get("details") as string) || undefined;
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined;
    const reviews = formData.get("reviews") ? parseInt(formData.get("reviews") as string) : undefined;
    const deleteImages = formData.getAll("deleteImages") as string[]; // urls to delete
    const imageFiles = formData.getAll("images") as File[];
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});
    const imagePaths: string[] = [];
    for (const file of imageFiles.slice(0, 3)) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const key = `services/${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (uploadRes.error) throw new Error(`Upload failed: ${uploadRes.error.message}`);
      const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
      imagePaths.push(publicUrlData.publicUrl);
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        title,
        details,
        price,
        reviews,
        images: {
          deleteMany: deleteImages?.length ? { url: { in: deleteImages } } : undefined,
          create: imagePaths.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll("id");
    if (!ids.length) return new Response(JSON.stringify({ error: "No ids" }), { status: 400 });
    await prisma.serviceImage.deleteMany({ where: { serviceId: { in: ids } } });
    await prisma.reservation.deleteMany({ where: { serviceId: { in: ids } } });
    await prisma.service.deleteMany({ where: { id: { in: ids } } });
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}


