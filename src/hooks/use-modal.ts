import { useEffect, useRef, RefObject } from 'react';

interface UseModalOptions {
  isOpen: boolean;
  onClose: () => void;
  enableFocusTrap?: boolean;
  enableEscapeKey?: boolean;
  disableBodyScroll?: boolean;
}

interface UseModalReturn<T extends HTMLElement> {
  modalRef: RefObject<T | null>;
}

export function useModal<T extends HTMLElement>({
  isOpen,
  onClose,
  enableFocusTrap = true,
  enableEscapeKey = true,
  disableBodyScroll = true,
}: UseModalOptions): UseModalReturn<T> {
  const modalRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    if (disableBodyScroll) {
      document.body.style.overflow = 'hidden';
    }

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (enableEscapeKey && e.key === 'Escape') {
        onClose();
        return;
      }

      if (enableFocusTrap && e.key === 'Tab') {
        if (focusableElements.length === 0) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (enableFocusTrap) {
      firstElement?.focus();
    }

    return () => {
      if (disableBodyScroll) {
        document.body.style.overflow = 'auto';
      }
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose, enableFocusTrap, enableEscapeKey, disableBodyScroll]);

  return { modalRef };
}
