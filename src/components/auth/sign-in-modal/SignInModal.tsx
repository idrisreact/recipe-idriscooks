import { authClient } from "@/src/utils/auth-client";
import Image from "next/image";
import { FC, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const SignInModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
          className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-md mx-auto p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // prevent clicks inside from bubbling to backdrop
        >
          {/* Close “X” in top‐right */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-4">Sign In</h2>

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
