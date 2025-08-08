import { render, screen } from '@testing-library/react';
import { RegisterForm } from './register-form';
import { MemoryRouter } from 'react-router-dom';

test('should display all validation error messages', () => {
  const mockProps = {
    formData: {
      email: 'test@example.com',
      name: '',
      password: 'short',
      passwordRepeat: 'mismatch',
    },
    errors: {
      name: 'Name is required.',
      password: 'Password must be at least 8 characters long...',
      passwordRepeat: 'Passwords do not match.',
    },
    loading: false,
    error: null,
    onSubmit: jest.fn(),
    onChange: jest.fn(),
    onGoogleSignIn: jest.fn(),
  };

  render(
    <MemoryRouter>
      <RegisterForm {...mockProps} />
    </MemoryRouter>
  );

  expect(screen.getByText('Name is required.')).toBeInTheDocument();
  expect(screen.getByText('Password must be at least 8 characters long...')).toBeInTheDocument();
  expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
});