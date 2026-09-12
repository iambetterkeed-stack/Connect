import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get server details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const server = await prisma.server.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        channels: {
          orderBy: { position: 'asc' }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                status: true
              }
            },
            roles: true
          }
        },
        roles: {
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    // Check if user is a member
    const isMember = server.members.some(m => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }

    return NextResponse.json({ server })
  } catch (error) {
    console.error("Error fetching server:", error)
    return NextResponse.json({ error: "Failed to fetch server" }, { status: 500 })
  }
}

// PUT - Update server
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon } = body

    // Check if user is the owner
    const server = await prisma.server.findUnique({
      where: { id: params.id }
    })

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    if (server.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only owner can update server" }, { status: 403 })
    }

    const updatedServer = await prisma.server.update({
      where: { id: params.id },
      data: {
        name,
        description,
        icon
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ server: updatedServer })
  } catch (error) {
    console.error("Error updating server:", error)
    return NextResponse.json({ error: "Failed to update server" }, { status: 500 })
  }
}

// DELETE - Delete server
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is the owner
    const server = await prisma.server.findUnique({
      where: { id: params.id }
    })

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    if (server.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only owner can delete server" }, { status: 403 })
    }

    await prisma.server.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Server deleted successfully" })
  } catch (error) {
    console.error("Error deleting server:", error)
    return NextResponse.json({ error: "Failed to delete server" }, { status: 500 })
  }
}