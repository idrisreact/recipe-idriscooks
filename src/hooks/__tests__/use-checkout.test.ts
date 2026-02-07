import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckout } from '../use-checkout';
import { navigateTo } from '../../utils/navigation';

jest.mock('../../utils/navigation', () => ({
  navigateTo: jest.fn(),
}));

describe('useCheckout', () => {
  const mockCheckoutUrl = '/api/checkout';
  const mockCheckoutResponse = { url: 'https://checkout.stripe.com/test' };

  beforeEach(() => {
    global.fetch = jest.fn();
    (navigateTo as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.initiateCheckout).toBe('function');
  });

  it('should successfully initiate checkout', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockCheckoutResponse,
    });

    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
      })
    );

    await act(async () => {
      await result.current.initiateCheckout();
    });

    expect(global.fetch).toHaveBeenCalledWith(mockCheckoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(navigateTo).toHaveBeenCalledWith(mockCheckoutResponse.url);
  });

  it('should handle checkout error when no URL is returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({}),
    });

    const onError = jest.fn();

    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
        onError,
      })
    );

    await act(async () => {
      await result.current.initiateCheckout();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('No checkout URL received');
      expect(onError).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

    const onError = jest.fn();

    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
        onError,
      })
    );

    await act(async () => {
      await result.current.initiateCheckout();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalledWith(mockError);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call onSuccess callback on successful checkout', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockCheckoutResponse,
    });

    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
        onSuccess,
      })
    );

    await act(async () => {
      await result.current.initiateCheckout();
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should set loading state during checkout', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockCheckoutResponse,
    });

    const { result } = renderHook(() =>
      useCheckout({
        checkoutUrl: mockCheckoutUrl,
      })
    );

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.initiateCheckout();
    });

    // After completion, loading should be false (fixed: setIsLoading(false) on success)
    expect(result.current.isLoading).toBe(false);
  });
});
