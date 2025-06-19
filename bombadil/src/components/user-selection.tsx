import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, Dumbbell } from "lucide-react"

interface RoleSelectionFormProps {
  loading: boolean
  error: string | null
  onRoleSelect: (role: 'client' | 'trainer') => void
  className?: string
}

export function RoleSelectionForm({
  loading,
  error,
  onRoleSelect,
  className,
  ...props
}: RoleSelectionFormProps) {
  return (
    <div 
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Choose Your Role</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Select how you'd like to use Bombadil
        </p>
      </div>

      {/* Global error message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          disabled={loading}
          onClick={() => onRoleSelect('client')}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-blue-100 p-2 rounded-md">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">I am a Client</div>
              <div className="text-sm text-muted-foreground">
                Looking for personal training services
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-20 flex-col gap-2 text-left hover:bg-green-50 hover:border-green-300 transition-colors"
          disabled={loading}
          onClick={() => onRoleSelect('trainer')}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-green-100 p-2 rounded-md">
              <Dumbbell className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">I am a Trainer</div>
              <div className="text-sm text-muted-foreground">
                Offering personal training services
              </div>
            </div>
          </div>
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">
            Setting up your profile...
          </div>
        </div>
      )}
    </div>
  )
}