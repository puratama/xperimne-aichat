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
    data: { role: "user", content: message, conversationId: convId },
  })

  const token = process.env.OPENROUTER_API_KEY
  if (!token) {
    return NextResponse.json({ error: "OpenRouter key not configured" }, { status: 500 })
  }

  let aiContent: string

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost:3030",
        "X-Title": "Xperimne Chatbot",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: message }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("OpenRouter API error:", res.status, errText)
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await res.json()
    aiContent = data.choices?.[0]?.message?.content ?? ""
  } catch (err) {
    console.error("OpenRouter API call failed:", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 })
  }

  const aiMessage = await prisma.message.create({
    data: { role: "assistant", content: aiContent, conversationId: convId },
  })

  return NextResponse.json({
    conversationId: convId,
    message: { id: aiMessage.id, role: aiMessage.role, content: aiMessage.content, createdAt: aiMessage.createdAt },
  })
}
