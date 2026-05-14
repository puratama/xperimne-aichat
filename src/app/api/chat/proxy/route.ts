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

  const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3030",
      "X-Title": "Xperimne Chatbot",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      stream: true,
      messages: [{ role: "user", content: message }],
    }),
  })

  if (!aiRes.ok) {
    const errText = await aiRes.text()
    console.error("OpenRouter API error:", aiRes.status, errText)
    return NextResponse.json({ error: "AI service error" }, { status: 502 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiRes.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      let buffer = ""

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "meta", conversationId: convId })}\n\n`)
      )

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          buffer += text

          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const chunk = parsed.choices?.[0]?.delta?.content ?? ""
              fullContent += chunk
            } catch {}
          }

          controller.enqueue(value)
        }

        if (fullContent) {
          await prisma.message.create({
            data: { role: "assistant", content: fullContent, conversationId: convId },
          })
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch (err) {
        console.error("Stream error:", err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
