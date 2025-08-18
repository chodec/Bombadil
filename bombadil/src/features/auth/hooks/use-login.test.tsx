import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useLogin } from '../hooks/use-login';
import { LoginData } from '../api/types';
import { googleLogin } from '../api/loginGoogle';
import { useAuth } from '@/lib/auth/providers/auth-provider';

// Mockování závislostí
const mockNavigate = jest.fn();
const mockLoginUser = jest.fn();
const mockGoogleLogin = jest.fn();
const mockCreateUserRecord = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/login', () => ({
  loginUser: (...args: any[]) => mockLoginUser(...args),
}));

jest.mock('../api/loginGoogle', () => ({
  googleLogin: (...args: any[]) => mockGoogleLogin(...args),
}));

jest.mock('@/lib/auth/providers/auth-provider', () => ({
  useAuth: jest.fn(() => ({
    refreshSession: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/user-profile', () => ({
  createUserRecord: (...args: any[]) => mockCreateUserRecord(...args),
}));

// Nastavení QueryClient a Wrapperu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

//------------------------------------
// Kompletně opravená verze testu pro useLogin hook
//------------------------------------

describe('useLogin hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('should set validation errors for invalid form data and not call API', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      result.current.updateFormData('email', 'neplatny-email');
      result.current.updateFormData('password', 'slabe');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.password).toBeDefined();
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  test('should handle successful login and refresh session', async () => {
    const mockRefreshSession = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ refreshSession: mockRefreshSession });
    
    mockCreateUserRecord.mockResolvedValueOnce({ role: 'client', name: 'Test User' });

    mockLoginUser.mockResolvedValueOnce({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client'
      },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    const validData: LoginData = {
      email: 'test@example.com',
      password: 'Password1!',
    };

    await act(async () => {
      result.current.updateFormData('email', validData.email);
      result.current.updateFormData('password', validData.password);
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith(validData);
      expect(mockRefreshSession).toHaveBeenCalledTimes(1); 
      expect(mockNavigate).toHaveBeenCalledWith('/client/dashboard');
    });
  });

  test('should call Google sign-in and redirect user', async () => {
    const googleLoginUrl = 'https://accounts.google.com/o/oauth2/v2/auth?mock=true';
    mockGoogleLogin.mockResolvedValueOnce({ url: googleLoginUrl });

    // Nové: Mockujeme getter a setter href na window.location
    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
    const mockHrefSetter = jest.fn();

    Object.defineProperty(window.location, 'href', {
      set: mockHrefSetter,
      get: () => 'about:blank', // Vracíme fiktivní URL, aby test nehavaroval
      configurable: true,
    });
    
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      result.current.signInWithGoogle();
    });

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
      // Nyní testujeme, že se setter mocku zavolal se správnou URL
      expect(mockHrefSetter).toHaveBeenCalledWith(googleLoginUrl);
    });

    // Po testu vrátíme původní chování
    if (originalHref) {
      Object.defineProperty(window.location, 'href', originalHref);
    }
  });
});