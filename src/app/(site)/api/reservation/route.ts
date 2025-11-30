export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({ include: { service: true }, orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify(reservations), { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { serviceId, fullName, phone } = await req.json();
    if (!serviceId || !fullName || !phone) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    const created = await prisma.reservation.create({ data: { serviceId, fullName, phone } });
    return new Response(JSON.stringify(created), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll("id");
    if (!ids.length) return new Response(JSON.stringify({ error: "No ids" }), { status: 400 });
    await prisma.reservation.deleteMany({ where: { id: { in: ids } } });
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, validated } = await req.json();
    if (!id || typeof validated !== "boolean") {
      return new Response(JSON.stringify({ error: "Missing id or validated" }), { status: 400 });
    }
    const updated = await prisma.reservation.update({ where: { id }, data: { validated } });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}


