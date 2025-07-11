import { useAuth } from '@/lib/auth/providers/auth-provider'
import { Navigate } from 'react-router-dom'

interface RouteGuardProps {
  children: React.ReactNode
  requireRole?: 'trainer' | 'client'
  fallback?: React.ReactNode
}

export function RouteGuard({ 
 children, 
 requireRole, 
 fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div> 
}: RouteGuardProps) {
 const { user, loading } = useAuth()

 if (loading) {
   return <>{fallback}</>
 }

 if (!user) {
   return <Navigate to="/auth/login" replace />
 }

 if (user.role === 'pending') {
   return <Navigate to="/auth/role-selection" replace />
 }

 if (requireRole && user.role !== requireRole) {
   if (user.role === 'trainer' && requireRole === 'client') {
     return <Navigate to="/trainer/dashboard" replace />
   }
   if (user.role === 'client' && requireRole === 'trainer') {
     return <Navigate to="/client/dashboard" replace />
   }
   
   return <Navigate to="/" replace />
 }

 return <>{children}</>
}