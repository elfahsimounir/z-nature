import bcrypt from "bcryptjs";
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    console.error('GET /api/user error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    }); // Log detailed error information
    return new Response(
      JSON.stringify({ error: 'Failed to fetch users. Please check the server logs for more details.' }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password, role = "user" } = body; // Accept role from the request body, default to "user"

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (!["user", "admin"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword, role }, // Use the role from the request body
      select: { id: true, email: true, name: true, role: true, image: true, createdAt: true, updatedAt: true },
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/user error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, password, role } = body as { id: string; name: string; email: string; password?: string; role: string };

    if (!id || !name || !email || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (!["user", "admin"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
    }

    const data: any = { name, email, role };
    if (password && password.trim().length > 0) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, image: true, createdAt: true, updatedAt: true },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Support repeated id params (?id=1&id=2) and comma-separated (?id=1,2)
    let ids = searchParams.getAll('id');
    if (ids.length === 0) {
      const single = searchParams.get('id');
      if (single) ids = single.split(',');
    }

    ids = ids.flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);

    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one user ID is required' }), { status: 400 });
    }

    const result = await prisma.user.deleteMany({ where: { id: { in: ids } } });
    return new Response(JSON.stringify({ deleted: result.count }), { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

// PATCH: update only the password
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, password } = body as { id: string; password: string };
    if (!id || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: { id: true, email: true, name: true, role: true, image: true, createdAt: true, updatedAt: true },
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error: any) {
    console.error('PATCH /api/user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}