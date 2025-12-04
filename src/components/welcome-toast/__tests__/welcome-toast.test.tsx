import { render, waitFor } from '@/src/test-utils';
import { WelcomeToast } from '../welcome-toast';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('@/src/components/auth/auth-components', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/src/utils/auth-client', () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
}));

describe('WelcomeToast', () => {
  const mockToast = toast as jest.Mocked<typeof toast>;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should not show toast when user is authenticated', () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    useAuth.mockReturnValue({
      session: { user: { id: '123' } },
      loading: false,
    });

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show toast when loading', () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    useAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should show toast for unauthenticated users', async () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    useAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    jest.useFakeTimers();
    render(<WelcomeToast />);

    // Fast-forward past the 2 second delay
    jest.advanceTimersByTime(2100);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('should not show toast if already seen in session', () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    useAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    sessionStorage.setItem('hasSeenWelcomeToast', 'true');

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should set sessionStorage after showing toast', async () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    useAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    jest.useFakeTimers();
    render(<WelcomeToast />);

    jest.advanceTimersByTime(2100);

    await waitFor(() => {
      expect(sessionStorage.getItem('hasSeenWelcomeToast')).toBe('true');
    });

    jest.useRealTimers();
  });
});
