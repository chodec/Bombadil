import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useRegister } from './use-register';
import { RegisterData } from '../api/types';
import { googleLogin } from '../api/loginGoogle'; // Nový import pro Google test

const mockNavigate = jest.fn();
const mockRegisterUser = jest.fn();
const mockGoogleLogin = jest.fn(); // Nový mock pro Google login

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/register', () => ({
  registerUser: (...args: any[]) => mockRegisterUser(...args),
}));

jest.mock('../api/loginGoogle', () => ({
  googleLogin: (...args: any[]) => mockGoogleLogin(...args),
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

describe('useRegister hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('should set validation errors for invalid form data and not call API', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.onChange('email', 'neplatny-email');
      result.current.onChange('password', 'slabe');
    });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.password).toBeDefined();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  test('should handle successful registration and navigate to login page', async () => {
    mockRegisterUser.mockResolvedValueOnce({
      success: true,
      userId: 'mock-user-id',
      message: 'Account created successfully. Welcome aboard!'
    });

    const { result } = renderHook(() => useRegister(), { wrapper });

    const validData: RegisterData = {
      email: 'test@example.com',
      name: 'Tester',
      password: 'Password1!',
      passwordRepeat: 'Password1!',
    };

    await act(async () => {
      result.current.onChange('email', validData.email);
      result.current.onChange('name', validData.name);
      result.current.onChange('password', validData.password);
      result.current.onChange('passwordRepeat', validData.passwordRepeat);
    });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(validData);
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  test('should set email error and not navigate on API error', async () => {
    mockRegisterUser.mockRejectedValueOnce({
      field: 'email',
      message: 'User with this email already exists',
    });

    const { result } = renderHook(() => useRegister(), { wrapper });

    const validData: RegisterData = {
      email: 'existing.user@example.com',
      name: 'Tester',
      password: 'Password1!',
      passwordRepeat: 'Password1!',
    };

    await act(async () => {
      result.current.onChange('email', validData.email);
      result.current.onChange('name', validData.name);
      result.current.onChange('password', validData.password);
      result.current.onChange('passwordRepeat', validData.passwordRepeat);
    });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });
    
    await waitFor(() => {
      expect(result.current.errors.email).toBe('User with this email already exists');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should set loading state correctly during API calls', async () => {
    let resolvePromise: (value: any) => void;
    const deferredPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockRegisterUser.mockReturnValue(deferredPromise);

    const { result } = renderHook(() => useRegister(), { wrapper });

    const validData = {
      email: 'test@example.com',
      name: 'Tester',
      password: 'Password1!',
      passwordRepeat: 'Password1!',
    };

    await act(async () => {
      result.current.onChange('email', validData.email);
      result.current.onChange('name', validData.name);
      result.current.onChange('password', validData.password);
      result.current.onChange('passwordRepeat', validData.passwordRepeat);
    });

    expect(result.current.loading).toBe(false);

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.loading).toBe(true);
    expect(mockRegisterUser).toHaveBeenCalledWith(validData);

    await act(async () => {
      resolvePromise({ success: true, message: 'OK' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  test('should not allow form submission while loading', async () => {
    let resolvePromise: (value: any) => void;
    const deferredPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockRegisterUser.mockReturnValue(deferredPromise);

    const { result } = renderHook(() => useRegister(), { wrapper });

    const validData = {
      email: 'test@example.com',
      name: 'Tester',
      password: 'Password1!',
      passwordRepeat: 'Password1!',
    };
    
    await act(async () => {
      result.current.onChange('email', validData.email);
      result.current.onChange('name', validData.name);
      result.current.onChange('password', validData.password);
      result.current.onChange('passwordRepeat', validData.passwordRepeat);
    });
    
    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    
    expect(mockRegisterUser).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => {} } as React.FormEvent);
    });
    
    expect(mockRegisterUser).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise({ success: true, message: 'OK' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});