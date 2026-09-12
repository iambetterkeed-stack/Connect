import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get channel messages (paginated)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if user has access to this channel
    const channel = await prisma.channel.findUnique({
      where: { id: params.id },
      include: {
        server: {
          include: {
            members: true
          }
        }
      }
    })

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    const isMember = channel.server.members.some(m => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { channelId: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        replyTo: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, attachments, replyToId } = body

    if (!content && !attachments) {
      return NextResponse.json({ error: "Message content or attachments required" }, { status: 400 })
    }

    // Check if user has access to this channel
    const channel = await prisma.channel.findUnique({
      where: { id: params.id },
      include: {
        server: {
          include: {
            members: true
          }
        }
      }
    })

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    const isMember = channel.server.members.some(m => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }

    // If replying to a message, check it exists
    if (replyToId) {
      const replyToMessage = await prisma.message.findUnique({
        where: { id: replyToId }
      })
      if (!replyToMessage) {
        return NextResponse.json({ error: "Reply to message not found" }, { status: 404 })
      }
    }

    const message = await prisma.message.create({
      data: {
        channelId: params.id,
        authorId: session.user.id,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        replyToId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}