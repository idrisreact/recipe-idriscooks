import { render, screen, fireEvent, waitFor } from '@/src/test-utils';
import { RecipeAccessButton } from '../recipe-access-button';
import { useAuth } from '@/src/components/auth/auth-components';
import { useCheckout } from '@/src/hooks/use-checkout';

// Mock dependencies
const mockPush = jest.fn();
const mockInitiateCheckout = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/src/components/auth/auth-components');
jest.mock('@/src/hooks/use-checkout');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseCheckout = useCheckout as jest.MockedFunction<typeof useCheckout>;

describe('RecipeAccessButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show "You have full access" when user has access', () => {
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
    mockUseCheckout.mockReturnValue({
      isLoading: false,
      error: null,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={true} />);

    expect(screen.getByText('You have full access')).toBeInTheDocument();
    expect(screen.queryByText(/Get Full Access/)).not.toBeInTheDocument();
  });

  it('should redirect to sign-up when clicked without session', async () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });
    mockUseCheckout.mockReturnValue({
      isLoading: false,
      error: null,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    const button = screen.getByRole('button', { name: /Get Full Access/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-up');
      expect(mockInitiateCheckout).not.toHaveBeenCalled();
    });
  });

  it('should initiate checkout when clicked with session', async () => {
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
    mockUseCheckout.mockReturnValue({
      isLoading: false,
      error: null,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    const button = screen.getByRole('button', { name: /Get Full Access/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInitiateCheckout).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true });
    mockUseCheckout.mockReturnValue({
      isLoading: false,
      error: null,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display pricing information', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });
    mockUseCheckout.mockReturnValue({
      isLoading: false,
      error: null,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    expect(screen.getByText(/Get Full Access - £10/i)).toBeInTheDocument();
    expect(screen.getByText(/Regular: £25/i)).toBeInTheDocument();
  });
});
