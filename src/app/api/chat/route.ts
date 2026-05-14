import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { conversationId, message } = await req.json()

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  let convId = conversationId

  if (!convId) {
    const conv = await prisma.conversation.create({
      data: {
        title: message.slice(0, 60) + (message.length > 60 ? "..." : ""),
        userId: session.user.id,
      },
    })
    convId = conv.id
  }

  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      conversationId: convId,
    },
  })

  return NextResponse.json({ conversationId: convId })
}
