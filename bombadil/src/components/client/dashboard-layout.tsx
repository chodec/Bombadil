import * as React from "react"
import {
  Home,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  User,
  Dumbbell
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Client-specific data
const clientData = {
  user: {
    name: "Jane Client",
    email: "client@fitcoach.com",
    avatar: "/avatars/client.jpg",
  },
  teams: [
    {
      name: "FitCoach",
      logo: Dumbbell,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/client-dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Workouts",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Today's Workout",
          url: "/client/workouts/today",
        },
        {
          title: "Schedule",
          url: "/client/workouts/schedule",
        },
        {
          title: "History",
          url: "/client/workouts/history",
        },
      ],
    },
    {
      title: "Goals",
      url: "#",
      icon: Target,
      items: [
        {
          title: "Current Goals",
          url: "/client/goals",
        },
        {
          title: "Set New Goal",
          url: "/client/goals/new",
        },
        {
          title: "Achievements",
          url: "/client/goals/achievements",
        },
      ],
    },
    {
      title: "Progress",
      url: "#",
      icon: TrendingUp,
      items: [
        {
          title: "Overview",
          url: "/client/progress",
        },
        {
          title: "Measurements",
          url: "/client/progress/measurements",
        },
        {
          title: "Photos",
          url: "/client/progress/photos",
        },
      ],
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Chat with Trainer",
          url: "/client/messages/trainer",
        },
        {
          title: "Group Chat",
          url: "/client/messages/group",
        },
      ],
    },
    {
      title: "Profile",
      url: "#",
      icon: User,
      items: [
        {
          title: "Personal Info",
          url: "/client/profile",
        },
        {
          title: "Preferences",
          url: "/client/profile/preferences",
        },
        {
          title: "Subscription",
          url: "/client/profile/subscription",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Weight Loss Journey",
      url: "/client/programs/weight-loss",
      icon: TrendingUp,
    },
    {
      name: "Strength Building",
      url: "/client/programs/strength",
      icon: Dumbbell,
    },
    {
      name: "Cardio Challenge",
      url: "/client/programs/cardio",
      icon: Target,
    },
  ],
}

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher teams={clientData.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={clientData.navMain} />
          <NavProjects projects={clientData.projects} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={clientData.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}