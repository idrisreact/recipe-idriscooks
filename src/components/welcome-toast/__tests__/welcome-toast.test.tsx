import { render, waitFor } from '@/src/test-utils';
import { WelcomeToast } from '../welcome-toast';
import toast from 'react-hot-toast';
import { useAuth } from '@/src/components/auth/auth-components';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('@/src/components/auth/auth-components');
jest.mock('@/src/utils/auth-client', () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('WelcomeToast', () => {
  const mockToast = toast as jest.Mocked<typeof toast>;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should not show toast when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      session: {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: 'session-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '123',
          expiresAt: new Date(),
          token: 'token',
        },
      },
      loading: false,
    });

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should not show toast when loading', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should show toast for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({
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
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    sessionStorage.setItem('hasSeenWelcomeToast', 'true');

    render(<WelcomeToast />);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should set sessionStorage after showing toast', async () => {
    mockUseAuth.mockReturnValue({
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
