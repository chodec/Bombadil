import { RouteGuard } from '@/lib/auth/guards/route-guard'
import { RoleSelectionPage } from '@/features/auth/pages/roleSelection'

export default function RoleSelection() {
  return (
    <RouteGuard>
      <RoleSelectionPage />
    </RouteGuard>
  )
}