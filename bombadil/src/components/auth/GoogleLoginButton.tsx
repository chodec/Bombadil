import { Button } from "@/components/ui/button"

interface GoogleLoginButtonProps {
  disabled?: boolean
  onClick: () => void
}

export function GoogleLoginButton({ disabled, onClick }: GoogleLoginButtonProps) {
  return (
    <Button 
      type="button"
      onClick={onClick}
      variant="outline" 
      className="w-full"
      disabled={disabled}
    >
      Continue with Google
    </Button>
  )
}