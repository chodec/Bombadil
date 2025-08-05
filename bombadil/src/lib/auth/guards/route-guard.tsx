import { useAuth } from '@/lib/auth/providers/auth-provider';
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  requireRole?: 'trainer' | 'client';
  fallback?: React.ReactNode;
}

export function RouteGuard({ 
  children, 
  requireRole, 
  fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div> 
}: RouteGuardProps) {
  const { user, profile, loading } = useAuth();

  // KROK 1: Nejprve počkáme, dokud se nenahrají data
  if (loading) {
    return <>{fallback}</>;
  }
  
  // KROK 2: Po načtení ověříme, zda je uživatel přihlášen
  // Toto je důležité, protože `profile` je závislé na `user`
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // KROK 3: Po načtení ověříme, zda má uživatel profil
  if (!profile) {
    return <Navigate to="/auth/role-selection" replace />;
  }

  // KROK 4: Zkontrolujeme, zda má uživatel `pending` roli
  if (profile.role === 'pending') {
    return <Navigate to="/auth/role-selection" replace />;
  }

  // KROK 5: Vaše speciální logika pro přesměrování
  if (requireRole && profile.role !== requireRole) {
    // Pokud je uživatel trenér a snaží se jít na stránku pro klienta, pošleme ho na jeho dashboard
    if (profile.role === 'trainer' && requireRole === 'client') {
      return <Navigate to="/trainer/dashboard" replace />;
    }
    // Pokud je uživatel klient a snaží se jít na stránku pro trenéra, pošleme ho na jeho dashboard
    if (profile.role === 'client' && requireRole === 'trainer') {
      return <Navigate to="/client/dashboard" replace />;
    }
    
    // Jinak přesměrujeme na hlavní stránku
    return <Navigate to="/" replace />;
  }

  // Pokud vše projde, zobrazíme požadovanou komponentu
  return <>{children}</>;
}