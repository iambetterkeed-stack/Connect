import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List server channels
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a member
    const server = await prisma.server.findUnique({
      where: { id: params.id },
      include: {
        members: true
      }
    })

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    const isMember = server.members.some(m => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }

    const channels = await prisma.channel.findMany({
      where: { serverId: params.id },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json({ channels })
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

// POST - Create a new channel
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
    const { name, type, position, categoryId } = body

    if (!name) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
    }

    // Check if user is the owner or has admin permissions
    const server = await prisma.server.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: { userId: session.user.id },
          include: { roles: true }
        }
      }
    })

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    const member = server.members[0]
    if (!member) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }

    // Check if user is owner or has admin role
    const isAdmin = server.ownerId === session.user.id || 
                    member.roles.some(role => role.permissions & 0x8000) // Admin permission bit

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get max position if not provided
    let channelPosition = position
    if (channelPosition === undefined) {
      const maxChannel = await prisma.channel.findFirst({
        where: { serverId: params.id },
        orderBy: { position: 'desc' }
      })
      channelPosition = maxChannel ? maxChannel.position + 1 : 0
    }

    const channel = await prisma.channel.create({
      data: {
        serverId: params.id,
        name,
        type: type || 'text',
        position: channelPosition,
        categoryId
      }
    })

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
  }
}