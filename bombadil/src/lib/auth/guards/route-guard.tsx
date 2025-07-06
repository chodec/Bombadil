import { useAuth } from '@/lib/auth/providers/auth-provider'
import { Navigate } from 'react-router-dom'

interface RouteGuardProps {
  children: React.ReactNode
  requireRole?: 'trainer' | 'client'
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function RouteGuard({ 
 children, 
 requireRole, 
 requireAuth = true, 
 fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div> 
}: RouteGuardProps) {
 const { user, loading, isAuthenticated } = useAuth()

 if (loading) {
   return <>{fallback}</>
 }

 if (requireAuth && !isAuthenticated) {
   return <Navigate to="/auth/login" replace />
 }

 if (requireAuth && user?.role === 'pending') {
   if (requireRole) {
     return <Navigate to="/auth/role-selection" replace />
   }
   return <>{children}</>
 }

 if (requireRole && user?.role !== requireRole) {
   if (user?.role === 'trainer' && requireRole === 'client') {
     return <Navigate to="/trainer/dashboard" replace />
   }
   if (user?.role === 'client' && requireRole === 'trainer') {
     return <Navigate to="/client/dashboard" replace />
   }
 }

 return <>{children}</>
}