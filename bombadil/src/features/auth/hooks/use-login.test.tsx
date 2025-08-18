import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useLogin } from '../hooks/use-login';
import { LoginData } from '../api/types';
import { useAuth } from '@/lib/auth/providers/auth-provider';

const mockNavigate = jest.fn();
const mockLoginUser = jest.fn();
const mockCreateUserRecord = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/login', () => ({
  loginUser: (...args: any[]) => mockLoginUser(...args),
}));

jest.mock('@/lib/auth/providers/auth-provider', () => ({
  useAuth: jest.fn(() => ({
    refreshSession: jest.fn(),
  })),
}));

jest.mock('@/lib/auth/user-profile', () => ({
  createUserRecord: (...args: any[]) => mockCreateUserRecord(...args),
}));

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
});