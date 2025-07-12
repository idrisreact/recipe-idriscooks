import { Recipes } from "@/src/components/recipe-server-component/recipes.server";
import { auth } from "@/src/utils/auth";
import { headers } from "next/headers";

export default async function RecipePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="wrapper page">
      <Recipes session={session} />
    </div>
  );
}
