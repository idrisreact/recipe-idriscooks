import { Text } from "@/src/components/ui/Text";
import { Heading } from "@/src/components/common/heading/heading";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { Session } from "@/src/types";

interface RecipeWelcomeHeaderProps {
  session: Session | null;
  onSignIn: () => void;
}

export function RecipeWelcomeHeader({
  session,
  onSignIn,
}: RecipeWelcomeHeaderProps) {
  if (session) {
    return (
      <>
        <Heading title="Welcome" subTitle={session.user.name} />
        <VerticalSpace space="16" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <Text as="h1" className="text-4xl">
          Welcome to Idris Cooks
        </Text>
        <button
          type="button"
          aria-label="Sign in with google"
          onClick={onSignIn}
          className="self-baseline bg-white p-2 text-black rounded-3xl border-2 text-sm cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
      <VerticalSpace space="16" />
    </>
  );
}
