import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from 'react-router-dom'
import { GoogleLoginButton } from "./GoogleLoginButton"

interface RegisterFormProps {
  formData: {
    email: string
    name: string
    password: string
    passwordRepeat: string
  }
  errors: Record<string, string>
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onChange: (field: keyof RegisterFormProps['formData'], value: string) => void
  onGoogleSignIn: () => void
  className?: string
}

export function RegisterForm({
  formData,
  errors,
  loading,
  error,
  onSubmit,
  onChange,
  onGoogleSignIn,
  className,
  ...props
}: RegisterFormProps) {
  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create a new account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          It's quick and easy.
        </p>
      </div>

      {/* Global error message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
            required 
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            required 
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
            required 
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password-repeat">Repeat password</Label>
          <Input 
            id="password-repeat" 
            type="password" 
            value={formData.passwordRepeat}
            onChange={(e) => onChange('passwordRepeat', e.target.value)}
            className={errors.passwordRepeat ? 'border-red-500' : ''}
            required 
          />
          {errors.passwordRepeat && (
            <p className="text-sm text-red-600">{errors.passwordRepeat}</p>
          )}
        </div>

        <Button 
          type="submit" 
          variant="defaultGreen" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create my account'}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        <GoogleLoginButton 
          disabled={loading} 
          onClick={onGoogleSignIn}
        />

      </div>

      <div className="text-center text-sm">
        Already have account?{" "}
        <Link to="/auth/login" className="underline underline-offset-4 text-[#297a25] hover:text-[#4fe048]">
          Log in
        </Link>
      </div>
    </form>
  )
}