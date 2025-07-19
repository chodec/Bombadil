import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLoginButton } from "./GoogleLoginButton"

interface LoginFormProps {
  formData: {
    email: string
    password: string
  }
  errors: Record<string, string>
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onChange: (field: keyof LoginFormProps['formData'], value: string) => void
  onGoogleSignIn: () => void
  className?: string
}

export function LoginForm({
  formData,
  errors,
  loading,
  error,
  onSubmit,
  onChange,
  onGoogleSignIn,
  className,
  ...props
}: LoginFormProps) {
  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>

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
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
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

        <Button 
          type="submit" 
          variant="defaultGreen" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
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
        Don&apos;t have an account?{" "}
        <Link to="/auth/register" className="underline underline-offset-4 text-[#297a25] hover:text-[#4fe048]">
          Sign up
        </Link>
      </div>
    </form>
  )
}