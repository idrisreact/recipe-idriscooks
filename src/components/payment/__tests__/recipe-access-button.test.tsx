import { render, screen, fireEvent, waitFor } from '@/src/test-utils';
import { RecipeAccessButton } from '../recipe-access-button';

// Mock dependencies
const mockPush = jest.fn();
const mockInitiateCheckout = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/src/components/auth/auth-components', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/hooks/use-checkout', () => ({
  useCheckout: jest.fn(),
}));

describe('RecipeAccessButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show "You have full access" when user has access', () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    const { useCheckout } = require('@/src/hooks/use-checkout');

    useAuth.mockReturnValue({ session: { user: { id: '123' } }, loading: false });
    useCheckout.mockReturnValue({
      isLoading: false,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={true} />);

    expect(screen.getByText('You have full access')).toBeInTheDocument();
    expect(screen.queryByText(/Get Full Access/)).not.toBeInTheDocument();
  });

  it('should redirect to sign-up when clicked without session', async () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    const { useCheckout } = require('@/src/hooks/use-checkout');

    useAuth.mockReturnValue({ session: null, loading: false });
    useCheckout.mockReturnValue({
      isLoading: false,
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
    const { useAuth } = require('@/src/components/auth/auth-components');
    const { useCheckout } = require('@/src/hooks/use-checkout');

    useAuth.mockReturnValue({
      session: { user: { id: '123', email: 'test@example.com' } },
      loading: false,
    });
    useCheckout.mockReturnValue({
      isLoading: false,
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
    const { useAuth } = require('@/src/components/auth/auth-components');
    const { useCheckout } = require('@/src/hooks/use-checkout');

    useAuth.mockReturnValue({ session: null, loading: true });
    useCheckout.mockReturnValue({
      isLoading: false,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display pricing information', () => {
    const { useAuth } = require('@/src/components/auth/auth-components');
    const { useCheckout } = require('@/src/hooks/use-checkout');

    useAuth.mockReturnValue({ session: null, loading: false });
    useCheckout.mockReturnValue({
      isLoading: false,
      initiateCheckout: mockInitiateCheckout,
    });

    render(<RecipeAccessButton hasAccess={false} />);

    expect(screen.getByText(/Get Full Access - £10/i)).toBeInTheDocument();
    expect(screen.getByText(/Regular: £25/i)).toBeInTheDocument();
  });
});
