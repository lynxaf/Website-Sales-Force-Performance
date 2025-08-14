"use client"

import { useEffect, useState } from "react"
import { UnifiedDashboard } from "@/components/unified-dashboard"

interface User {
  username: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return <UnifiedDashboard user={user} />
}
