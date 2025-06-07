"use client";
import { authClient } from "@/src/utils/auth-client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
import { CategoryTitle } from "../catergory/catergory-title";
import { VerticalSpace } from "../ui/VerticalSpace";
import { useRouter } from "next/navigation";

import recipesData from "../../../data/recipe.json";
import { ByTagIndex, RecipesData } from "@/src/types/recipes.types";

export function groupRecipesByTag(data: RecipesData): ByTagIndex {
  const byTag: ByTagIndex = {};

  for (const recipe of data.recipes) {
    for (const tag of recipe.tags) {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push({ id: recipe.id, title: recipe.title });
    }
  }

  return byTag;
}
interface Props {
  session: Session | null;
}

export const Recipes = ({ session }: Props) => {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const router = useRouter();

  const tags = groupRecipesByTag(recipesData);

  console.log(tags);

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
            aria-label="sign in with google"
            onClick={signIn}
            className="self-baseline bg-white p-2 text-black rounded-3xl border-2 text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      )}
      <VerticalSpace space="16" />
      <CategoryTitle
        title="Featured"
        onClick={() => router.push("/featured")}
      />
      {JSON.stringify({ tags }, null, 2)}
    </div>
  );
};
