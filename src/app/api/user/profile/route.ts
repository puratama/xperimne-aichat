import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, password: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { password, ...rest } = user
  return NextResponse.json({ ...rest, hasPassword: !!password })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const data: Record<string, string> = {}

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }
    if (body.name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be under 100 characters" }, { status: 400 })
    }
    data.name = body.name.trim()
  }

  if (body.image !== undefined) {
    if (body.image !== null && (typeof body.image !== "string" || !body.image.startsWith("http"))) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }
    data.image = body.image || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, image: true },
  })

  return NextResponse.json(updated)
}
