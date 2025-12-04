import { renderHook, act, waitFor } from '@testing-library/react';
import { useShare } from '../use-share';

describe('useShare', () => {
  const mockShareData = {
    title: 'Test Recipe',
    text: 'A delicious test recipe',
    url: 'https://example.com/recipe/test',
  };

  beforeEach(() => {
    Object.defineProperty(navigator, 'share', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: jest.fn(),
      },
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current.isSharing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.share).toBe('function');
  });

  it('should detect Web Share API support', () => {
    const { result } = renderHook(() => useShare());
    expect(result.current.isSupported).toBe(false);

    Object.defineProperty(navigator, 'share', {
      value: jest.fn(),
      writable: true,
    });

    const { result: result2 } = renderHook(() => useShare());
    expect(result2.current.isSupported).toBe(true);
  });

  it('should share using Web Share API when supported', async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useShare({ onSuccess }));

    await act(async () => {
      await result.current.share(mockShareData);
    });

    expect(mockShare).toHaveBeenCalledWith(mockShareData);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should fallback to clipboard when Web Share API is not supported', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useShare({
        fallbackToCopy: true,
        onSuccess,
      })
    );

    await act(async () => {
      await result.current.share(mockShareData);
    });

    expect(mockWriteText).toHaveBeenCalledWith(
      `${mockShareData.title} - ${mockShareData.url}`
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should throw error when Web Share API is not supported and fallback is disabled', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useShare({
        fallbackToCopy: false,
        onError,
      })
    );

    await act(async () => {
      await result.current.share(mockShareData);
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should handle share cancellation (AbortError)', async () => {
    const mockShare = jest.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'));
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useShare({ onError }));

    await act(async () => {
      await result.current.share(mockShareData);
    });

    expect(onError).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should handle share errors', async () => {
    const mockError = new Error('Share failed');
    const mockShare = jest.fn().mockRejectedValue(mockError);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useShare({ onError }));

    await act(async () => {
      await result.current.share(mockShareData);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should set isSharing state during share operation', async () => {
    let resolveShare: () => void;
    const sharePromise = new Promise<void>((resolve) => {
      resolveShare = resolve;
    });

    const mockShare = jest.fn().mockReturnValue(sharePromise);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    const { result } = renderHook(() => useShare());

    act(() => {
      result.current.share(mockShareData);
    });

    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      resolveShare!();
      await sharePromise;
    });

    expect(result.current.isSharing).toBe(false);
  });

  it('should fallback to just URL when title is not provided', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    const { result } = renderHook(() =>
      useShare({
        fallbackToCopy: true,
      })
    );

    await act(async () => {
      await result.current.share({ url: mockShareData.url });
    });

    expect(mockWriteText).toHaveBeenCalledWith(mockShareData.url);
  });
});
