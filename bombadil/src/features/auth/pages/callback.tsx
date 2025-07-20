import { useAuthCallback } from '../hooks/use-callback'

export const AuthCallbackPage = () => {
  const { loading, error } = useAuthCallback()

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Processing login...</p>
        </div>
      </div>
    )
  }

  return null
}