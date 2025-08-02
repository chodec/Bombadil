import { GalleryVerticalEnd } from "lucide-react";
import { RoleSelectionForm } from "@/components/auth/user-selection";
import { useRoleSelection } from "../hooks/use-roleSelection";
import { useAuth } from '@/lib/auth/providers/auth-provider';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RoleSelectionPage = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Processing session...</p>
        </div>
      </div>
    );
  }
  
  const { 
    loading: formLoading, 
    error, 
    handleRoleSelect 
  } = useRoleSelection();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Bombadil
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RoleSelectionForm 
              loading={formLoading}
              error={error}
              onRoleSelect={handleRoleSelect}
            />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};