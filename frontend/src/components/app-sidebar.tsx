"use client"

import { BarChart3, Building2, FileSpreadsheet, Home, LogOut, Award, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  user: { username: string; role: string }
}

// const unifiedItems = [
//   { title: "Dashboard", url: "/dashboard", icon: Home },
//   { title: "Performance Overview", url: "/dashboard/performance", icon: BarChart3 },
//   { title: "Category Analysis", url: "/dashboard/categories", icon: Award },
//   { title: "Productivity Analysis", url: "/dashboard/productivity", icon: Activity },
//   { title: "Reports", url: "/dashboard/reports", icon: FileSpreadsheet },
// ]

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()

  // const getMenuItems = () => {
  //   return unifiedItems
  // }

  const getRoleTitle = () => {
    switch (user.role) {
      case "super_admin":
        return "Super Admin"
      case "team_leader":
        return "Team Leader"
      case "sales_person":
        return "Sales Person"
      default:
        return "User"
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">Sales Dashboard</h2>
            <p className="text-sm text-muted-foreground">{getRoleTitle()}</p>
          </div>
        </div>
      </SidebarHeader>

      {/* <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent> */}

      <SidebarFooter>
        <div className="p-2">
          <div className="mb-2 text-sm">
            <p className="font-medium">{user.username}</p>
            <p className="text-muted-foreground">{getRoleTitle()}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
