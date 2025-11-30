import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await prisma.service.findMany({ include: { images: true } });
    return new Response(JSON.stringify({ services }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}
