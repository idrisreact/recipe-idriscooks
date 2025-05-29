import { authClient } from "@/src/utils/auth-client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
interface Props {
  session: Session | null;
}

export const Recipes = ({ session }: Props) => {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };
  return (
    <div>
      {session ? (
        <Heading title="Welcome" subTitle={session.user.name} />
      ) : (
        <div className="flex flex-col gap-5 ">
          <Text as="h1" className="text-4xl">
            Welcome to Idris Cooks{" "}
          </Text>
          <button
            type="button"
            aria-label="sign in with google"
            onClick={signIn}
            className="self-baseline bg-white p-2 text-black rounded-3xl border-2 text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
};
