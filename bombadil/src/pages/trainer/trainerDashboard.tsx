import { RouteGuard } from '@/lib/auth/guards/route-guard'
import { TrainerDashboardPage } from '@/features/trainer/pages/dashboard'

export default function TrainerDashboard() {
  return (
    <RouteGuard requireRole="trainer">
      <TrainerDashboardPage />
    </RouteGuard>
  )
}