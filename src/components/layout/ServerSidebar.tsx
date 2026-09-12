"use client"

import { motion } from "framer-motion"

interface Server {
  id: string
  name: string
  icon?: string
}

interface ServerSidebarProps {
  servers: Server[]
  currentServerId?: string
  onServerSelect: (serverId: string) => void
  onCreateServer: () => void
}

export default function ServerSidebar({ servers, currentServerId, onServerSelect, onCreateServer }: ServerSidebarProps) {
  return (
    <div className="w-18 bg-[#1e293b] flex flex-col items-center py-4 gap-2">
      {/* Home/DM Button */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
          !currentServerId ? 'bg-[#3b82f6]' : 'bg-[#334155] hover:bg-[#475569]'
        }`}
        onClick={() => onServerSelect("")}
      >
        <img src="/logo.svg" alt="Connect" className="w-8 h-8" />
      </motion.div>

      <div className="w-8 h-0.5 bg-[#334155] my-2"></div>

      {/* Server List */}
      {servers.map((server, index) => (
        <motion.div
          key={server.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
            currentServerId === server.id ? 'bg-[#3b82f6]' : 'bg-[#334155] hover:bg-[#475569]'
          }`}
          onClick={() => onServerSelect(server.id)}
          title={server.name}
        >
          {server.icon ? (
            <img src={server.icon} alt={server.name} className="w-8 h-8 rounded-full" />
          ) : (
            <span className="text-white font-semibold text-lg">
              {server.name.charAt(0).toUpperCase()}
            </span>
          )}
        </motion.div>
      ))}

      {/* Add Server Button */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center cursor-pointer transition-colors"
        onClick={onCreateServer}
        title="Add Server"
      >
        <span className="text-white text-2xl font-light">+</span>
      </motion.div>
    </div>
  )
}