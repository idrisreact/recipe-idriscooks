import { authClient } from "@/src/utils/auth-client";
import Image from "next/image";
import { FC, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export const SignInModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Save current focus and manage body scroll
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    // Focus management
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (focusableElements.length === 0) return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [onClose]);

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({ provider: "google" });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-50"
        onClick={onClose} // clicking the backdrop closes the modal
      />

      {/* Centered modal box */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md mx-auto p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // prevent clicks inside from bubbling to backdrop
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-title"
        >
          {/* Close "X" in top‐right */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            aria-label="Close sign in modal"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 id="sign-in-title" className="text-2xl font-semibold mb-4">Sign In</h2>

          <Button
            variant="icon"
            className="w-full cursor-pointer"
            onClick={handleGoogleSignIn}
          >
            <Image
              src="/google-icon.svg"
              height={20}
              width={20}
              alt="google logo"
            />
            Continue with Google
          </Button>

          {/* 
            If you want to add a separate email/password form, you can add it here.
            For example:
            <form onSubmit={...}>
              <input name="email" ... />
              <input name="password" ... />
              <button type="submit">Sign In</button>
            </form>
          */}
        </div>
      </div>
    </>
  );
};
