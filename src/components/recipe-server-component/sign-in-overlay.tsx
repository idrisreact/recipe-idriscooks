"use client";
import { Button } from "@/components/ui/button";
import { Text } from "@/src/components/ui/Text";
import { useAuth } from "@/src/hooks/use-auth";
import { useRouter } from "next/navigation";

interface SignInOverlayProps {
  noBackground?: boolean;
  onClose?: () => void;
  position?: "center" | "top";
}

export function SignInOverlay({
  noBackground = false,
  onClose,
  position = "center",
}: SignInOverlayProps) {
  const { signIn } = useAuth();
  const router = useRouter();

  const handleBrowse = () => {
    if (onClose) onClose();
    router.push("/recipes");
  };

  const content = (
    <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <Text as="h3" className="text-xl font-bold mb-2">
        Sign in to view recipe details
      </Text>
      <Text className="text-gray-600 mb-6">
        Create an account or sign in to access the full recipe ingredients,
        instructions, and more features.
      </Text>
      <div className="flex gap-3 justify-center">
        <Button onClick={signIn} className="bg-blue-600 hover:bg-blue-700">
          Sign In
        </Button>
        <Button variant="outline" onClick={handleBrowse}>
          Browse Recipes
        </Button>
      </div>
    </div>
  );

  if (noBackground) {
    return content;
  }

  return (
    <div
      className={`absolute inset-0 top-0 left-0 right-0 bottom-0 flex ${
        {
          center: "items-center",
          top: "items-start mt-12 md:mt-24",
        }[position]
      } justify-center bg-white/80 backdrop-blur-sm rounded-lg`}
    >
      {content}
    </div>
  );
}
