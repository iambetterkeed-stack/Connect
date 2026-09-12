import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const httpServer = createServer()
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Store connected users
const connectedUsers = new Map<string, { userId: string; username: string }>() // socketId -> user info

// Authentication middleware (simplified for development)
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId
  const username = socket.handshake.auth.username

  if (!userId || !username) {
    return next(new Error("Authentication error: Missing userId or username"))
  }

  socket.data.userId = userId
  socket.data.username = username
  next()
})

io.on("connection", (socket) => {
  const userId = socket.data.userId
  const username = socket.data.username

  console.log(`User connected: ${username} (${userId})`)
  connectedUsers.set(socket.id, { userId, username })

  // Update user status to online
  updateUserStatus(userId, "online")

  // Join server rooms
  socket.on("join-server", async (serverId: string) => {
    try {
      // Verify user is member of server
      const member = await prisma.serverMember.findUnique({
        where: {
          serverId_userId: {
            serverId,
            userId
          }
        }
      })

      if (member) {
        socket.join(`server:${serverId}`)
        
        // Get online users in server
        const serverMembers = await prisma.serverMember.findMany({
          where: { serverId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                status: true
              }
            }
          }
        })

        const onlineUsers = serverMembers.filter(m => 
          Array.from(connectedUsers.values()).some(u => u.userId === m.userId)
        )

        socket.emit("server-joined", {
          serverId,
          onlineUsers: onlineUsers.map(m => m.user)
        })

        // Notify others in server
        socket.to(`server:${serverId}`).emit("user-joined-server", {
          userId,
          username,
          serverId
        })
      }
    } catch (error) {
      console.error("Error joining server:", error)
    }
  })

  // Join channel rooms
  socket.on("join-channel", (channelId: string) => {
    socket.join(`channel:${channelId}`)
    console.log(`${username} joined channel: ${channelId}`)
  })

  // Leave channel rooms
  socket.on("leave-channel", (channelId: string) => {
    socket.leave(`channel:${channelId}`)
    console.log(`${username} left channel: ${channelId}`)
  })

  // Send message
  socket.on("send-message", async (data: { channelId: string; content: string; attachments?: any[]; replyToId?: string }) => {
    try {
      const { channelId, content, attachments, replyToId } = data

      // Verify user has access to channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          server: {
            include: {
              members: true
            }
          }
        }
      })

      if (!channel || !channel.server.members.some(m => m.userId === userId)) {
        socket.emit("error", { message: "Cannot send message to this channel" })
        return
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          channelId,
          authorId: userId,
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

      // Broadcast to channel
      io.to(`channel:${channelId}`).emit("new-message", message)
    } catch (error) {
      console.error("Error sending message:", error)
      socket.emit("error", { message: "Failed to send message" })
    }
  })

  // Typing indicator
  socket.on("typing", (data: { channelId: string; isTyping: boolean }) => {
    socket.to(`channel:${data.channelId}`).emit("user-typing", {
      userId,
      username,
      channelId: data.channelId,
      isTyping: data.isTyping
    })
  })

  // Add reaction
  socket.on("add-reaction", async (data: { messageId: string; emoji: string }) => {
    try {
      const { messageId, emoji } = data

      // Check if reaction already exists
      const existingReaction = await prisma.messageReaction.findUnique({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId,
            emoji
          }
        }
      })

      if (existingReaction) {
        // Remove reaction
        await prisma.messageReaction.delete({
          where: { id: existingReaction.id }
        })
      } else {
        // Add reaction
        await prisma.messageReaction.create({
          data: {
            messageId,
            userId,
            emoji
          }
        })
      }

      // Get updated reactions
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
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
          }
        }
      })

      // Broadcast to channel
      const channel = await prisma.message.findUnique({
        where: { id: messageId },
        select: { channelId: true }
      })

      if (channel) {
        io.to(`channel:${channel.channelId}`).emit("message-reactions-updated", {
          messageId,
          reactions: message?.reactions || []
        })
      }
    } catch (error) {
      console.error("Error handling reaction:", error)
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${username} (${userId})`)
    connectedUsers.delete(socket.id)
    
    // Update user status to offline
    updateUserStatus(userId, "offline")

    // Notify servers
    socket.rooms.forEach(room => {
      if (room.startsWith("server:")) {
        const serverId = room.split(":")[1]
        socket.to(room).emit("user-left-server", {
          userId,
          username,
          serverId
        })
      }
    })
  })
})

async function updateUserStatus(userId: string, status: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status }
    })
  } catch (error) {
    console.error("Error updating user status:", error)
  }
}

const PORT = process.env.SOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})