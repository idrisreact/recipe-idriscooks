import { Recipes } from "@/src/components/recipe-server-component/recipes.server";
import { auth } from "@/src/utils/auth";
import { headers } from "next/headers";
import { groupRecipesByTag, getTagsByKeys } from "@/src/utils";
import recipesData from "../../../data/recipe.json";

export default async function RecipePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const TAG_BY_KEYS = getTagsByKeys(groupRecipesByTag(recipesData));
  return (
    <div className="wrapper page">
      <Recipes session={session} tags={TAG_BY_KEYS} />
    </div>
  );
}
