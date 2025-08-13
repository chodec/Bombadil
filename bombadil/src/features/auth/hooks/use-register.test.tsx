// use-register.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useRegister } from './use-register';
import { RegisterData } from '../api/types';

// Mockování funkcí mimo hook
const mockNavigate = jest.fn();
const mockRegisterUser = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../api/register', () => ({
  registerUser: (...args: any[]) => mockRegisterUser(...args),
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

  // Tento test už procházel, ale pro jistotu ho ponecháme
  test('should set validation errors for invalid form data and not call API', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.updateFormData('email', 'neplatny-email');
      result.current.updateFormData('password', 'slabe');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.password).toBeDefined();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  // OPRAVENÝ TEST: Aktualizuje data a pak teprve volá handleSubmit
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

    // Nejdříve aktualizace dat v jednom bloku `act`
    await act(async () => {
      result.current.updateFormData('email', validData.email);
      result.current.updateFormData('name', validData.name);
      result.current.updateFormData('password', validData.password);
      result.current.updateFormData('passwordRepeat', validData.passwordRepeat);
    });

    // Až poté odeslání formuláře v dalším bloku `act`
    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(validData);
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  // OPRAVENÝ TEST: Zajišťuje, že se odesílají platná data před mockovanou chybou z API
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

    // Nejdříve aktualizace dat
    await act(async () => {
      result.current.updateFormData('email', validData.email);
      result.current.updateFormData('name', validData.name);
      result.current.updateFormData('password', validData.password);
      result.current.updateFormData('passwordRepeat', validData.passwordRepeat);
    });

    // Až poté odeslání formuláře
    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });
    
    await waitFor(() => {
      expect(result.current.errors.email).toBe('User with this email already exists');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});