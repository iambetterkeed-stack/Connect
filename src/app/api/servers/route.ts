import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List user's servers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ servers })
  } catch (error) {
    console.error("Error fetching servers:", error)
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 })
  }
}

// POST - Create a new server
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon } = body

    if (!name) {
      return NextResponse.json({ error: "Server name is required" }, { status: 400 })
    }

    // Create server and add owner as member
    const server = await prisma.server.create({
      data: {
        name,
        description,
        icon,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            roleIds: [] // Owner has implicit admin permissions
          }
        },
        roles: {
          create: [
            {
              name: "Admin",
              color: "#ef4444",
              permissions: 0xFFFFFFFF, // All permissions
              position: 0
            },
            {
              name: "Moderator",
              color: "#3b82f6",
              permissions: 0x0FFF, // Moderate permissions
              position: 1
            },
            {
              name: "Member",
              color: "#ffffff",
              permissions: 0x0001, // Basic permissions
              position: 2
            }
          ]
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ server }, { status: 201 })
  } catch (error) {
    console.error("Error creating server:", error)
    return NextResponse.json({ error: "Failed to create server" }, { status: 500 })
  }
}