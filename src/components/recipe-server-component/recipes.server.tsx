"use client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
import { CategoryTitle } from "../catergory/catergory-title";
import { VerticalSpace } from "../ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useMemo } from "react";

interface Props {
  session: Session | null;
  tags: string[];
}

const MAX_TAG_CATEGORIES = 5;

export const Recipes = ({ session, tags }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();

  const slugs = useMemo(() => tags.slice(0, MAX_TAG_CATEGORIES), [tags]);

  return (
    <div>
      {session ? (
        <Heading title="Welcome" subTitle={session.user.name} />
      ) : (
        <div className="flex flex-col gap-5 ">
          <Text as="h1" className="text-4xl">
            Welcome to Idris Cooks
          </Text>
          <button
            type="button"
            aria-label="Sign in with google"
            onClick={signIn}
            className="self-baseline bg-white p-2 text-black rounded-3xl border-2 text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      )}
      <VerticalSpace space="16" />

      <div>
        {slugs &&
          slugs.map((val) => (
            <CategoryTitle
              title={val}
              key={val}
              onClick={() => router.push(`/recipes/category/${val}`)}
            />
          ))}
      </div>
    </div>
  );
};
