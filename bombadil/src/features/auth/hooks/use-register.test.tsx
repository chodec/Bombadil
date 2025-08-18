import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useRegister } from './use-register';
import { RegisterData } from '../api/types';
import { googleLogin } from '../api/loginGoogle';

// Mockování závislostí
const mockNavigate = jest.fn();
const mockRegisterUser = jest.fn();
const mockGoogleLogin = jest.fn();

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
// Nová, opravená verze
//------------------------------------

describe('useRegister hook', () => {
  // Testy, které nevyžadují speciální mockování window.location
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

  // Test, který způsobuje problém, je upraven tak, aby fungoval
  test('should call Google sign-in and redirect user', async () => {
    const googleLoginUrl = 'https://accounts.google.com/o/oauth2/v2/auth?mock=true';
    mockGoogleLogin.mockResolvedValueOnce({ url: googleLoginUrl });

    // Vytvoříme mock pro window.location a přidáme do něj vlastnost, která se dá kontrolovat
    const mockLocation = { href: '' };

    // Použijeme spyOn s getterem, abychom dočasně nahradili window.location naším mockem
    // To je nejspolehlivější způsob, jak obejít omezení JSDOM
    // @ts-ignore - Jest spyOn pro 'get' je funkční, ale TS to může hlásit jako chybu
    const spy = jest.spyOn(window, 'location', 'get').mockReturnValue(mockLocation);
    
    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.onGoogleSignIn();
    });

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
      // Ověříme, že mock objekt zachytil správnou URL
      expect(mockLocation.href).toBe(googleLoginUrl);
    });

    // Po testu vrátíme původní chování, aby nedošlo ke kolizím v jiných testech
    spy.mockRestore();
  });
});