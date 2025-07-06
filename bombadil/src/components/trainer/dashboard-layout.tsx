import * as React from "react"
import {
  Users,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  Home,
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

// Trainer-specific data
const trainerData = {
  user: {
    name: "John Trainer",
    email: "trainer@fitcoach.com",
    avatar: "/avatars/trainer.jpg",
  },
  teams: [
    {
      name: "FitCoach Pro",
      logo: Dumbbell,
      plan: "Trainer",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/trainer-dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Clients",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Clients",
          url: "/trainer/clients",
        },
        {
          title: "Add Client",
          url: "/trainer/clients/new",
        },
        {
          title: "Client Groups",
          url: "/trainer/clients/groups",
        },
      ],
    },
    {
      title: "Workouts",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Schedule",
          url: "/trainer/workouts/schedule",
        },
        {
          title: "Programs",
          url: "/trainer/workouts/programs",
        },
        {
          title: "Templates",
          url: "/trainer/workouts/templates",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Overview",
          url: "/trainer/analytics",
        },
        {
          title: "Client Progress",
          url: "/trainer/analytics/progress",
        },
        {
          title: "Performance",
          url: "/trainer/analytics/performance",
        },
      ],
    },
    {
      title: "Billing",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Invoices",
          url: "/trainer/billing/invoices",
        },
        {
          title: "Payments",
          url: "/trainer/billing/payments",
        },
        {
          title: "Subscriptions",
          url: "/trainer/billing/subscriptions",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/trainer/settings/profile",
        },
        {
          title: "Preferences",
          url: "/trainer/settings/preferences",
        },
        {
          title: "Notifications",
          url: "/trainer/settings/notifications",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Weight Loss Program",
      url: "/trainer/programs/weight-loss",
      icon: BarChart3,
    },
    {
      name: "Strength Training",
      url: "/trainer/programs/strength",
      icon: Dumbbell,
    },
    {
      name: "Cardio Bootcamp",
      url: "/trainer/programs/cardio",
      icon: Calendar,
    },
  ],
}

interface TrainerLayoutProps {
  children: React.ReactNode
}

export function TrainerLayout({ children }: TrainerLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher teams={trainerData.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={trainerData.navMain} />
          <NavProjects projects={trainerData.projects} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={trainerData.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}