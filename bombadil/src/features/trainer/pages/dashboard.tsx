import { TrainerLayout } from "@/components/trainer/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity
} from "lucide-react"

export function TrainerDashboardPage () { 
  // Mock data - later replace with actual API calls
  const stats = {
    totalClients: 24,
    activeClients: 18,
    todaysSessions: 6,
    monthlyRevenue: 4500,
    completionRate: 87
  }

  const recentClients = [
    { name: "John Doe", lastSession: "2 hours ago", status: "active" },
    { name: "Jane Smith", lastSession: "Yesterday", status: "active" },
    { name: "Mike Johnson", lastSession: "2 days ago", status: "inactive" },
  ]

  const upcomingSessions = [
    { time: "10:00 AM", client: "Sarah Wilson", type: "Personal Training" },
    { time: "2:00 PM", client: "David Brown", type: "Nutrition Consultation" },
    { time: "4:00 PM", client: "Lisa Anderson", type: "Group Session" },
  ]

  return (
    <SidebarProvider>
      <TrainerLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your clients today.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.activeClients / stats.totalClients) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todaysSessions}</div>
                <p className="text-xs text-muted-foreground">
                  3 completed, 3 remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Clients */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Client Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClients.map((client, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last session: {client.lastSession}
                        </p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="text-sm font-mono text-muted-foreground">
                        {session.time}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{session.client}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TrainerLayout>
    </SidebarProvider>
  )
}