"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

export function useSocket() {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: {
        userId: session.user.id,
        username: session.user.username || session.user.name || "User"
      }
    })

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.io server")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.io server")
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  return { socket, isConnected }
}