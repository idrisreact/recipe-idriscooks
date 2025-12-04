import { renderHook } from '@testing-library/react';
import { useModal } from '../use-modal';

describe('useModal', () => {
  let mockModalElement: HTMLDivElement;

  beforeEach(() => {
    mockModalElement = document.createElement('div');
    mockModalElement.innerHTML = `
      <button id="first">First</button>
      <button id="middle">Middle</button>
      <button id="last">Last</button>
    `;
    document.body.appendChild(mockModalElement);
  });

  afterEach(() => {
    document.body.removeChild(mockModalElement);
    document.body.style.overflow = '';
  });

  it('should return a ref object', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useModal({
        isOpen: false,
        onClose,
      })
    );

    expect(result.current.modalRef).toBeDefined();
    expect(result.current.modalRef.current).toBeNull();
  });

  it('should disable body scroll when modal is open', () => {
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ isOpen }) =>
        useModal({
          isOpen,
          onClose,
          disableBodyScroll: true,
        }),
      { initialProps: { isOpen: false } }
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when modal is closed', () => {
    const onClose = jest.fn();
    const { rerender, unmount } = renderHook(
      ({ isOpen }) =>
        useModal({
          isOpen,
          onClose,
          disableBodyScroll: true,
        }),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    renderHook(() =>
      useModal({
        isOpen: true,
        onClose,
        enableEscapeKey: true,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onClose when Escape key is disabled', () => {
    const onClose = jest.fn();
    renderHook(() =>
      useModal({
        isOpen: true,
        onClose,
        enableEscapeKey: false,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should handle Tab key for focus trap', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useModal({
        isOpen: true,
        onClose,
        enableFocusTrap: true,
      })
    );

    result.current.modalRef.current = mockModalElement;

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    document.dispatchEvent(tabEvent);
  });

  it('should not enable focus trap when disabled', () => {
    const onClose = jest.fn();
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useModal({
        isOpen: true,
        onClose,
        enableFocusTrap: false,
      })
    );

    expect(focusSpy).not.toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('should cleanup event listeners on unmount', () => {
    const onClose = jest.fn();
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useModal({
        isOpen: true,
        onClose,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
