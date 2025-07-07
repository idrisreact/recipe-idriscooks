"use client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
import { CategoryTitle } from "../catergory/catergory-title";
import { VerticalSpace } from "../ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import recipes from "@/data/recipe.json";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Card } from "../card/card";

interface Props {
  session: Session | null;
  tags: string[];
}

const MAX_TAG_CATEGORIES = 5;

export const Recipes = ({ session, tags }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();

  const slugs = useMemo(() => tags.slice(0, MAX_TAG_CATEGORIES), [tags]);
  const [searchedRecipe, setSearchRecipe] = useState("");

  const formSchema = z.object({
    search: z.string().min(3, "must be more than 3 letters long"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const raw = form.watch("search");

  const debounceValue = useDebounce(raw, 500);
  const [results, setResults] = useState<string | null>("");
  useEffect(() => {
    if (debounceValue.length > 3) {
      const match = recipes.recipes.find((recipe) =>
        recipe.title
          .toLocaleLowerCase()
          .includes(debounceValue.toLocaleLowerCase())
      );
      setResults(match?.title ?? "no results found");
    } else {
      setResults(null);
    }
  }, [debounceValue]);

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

      <div className="mx-auto lg:w-4xl">
        <Form {...form}>
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Search for recipes</FormLabel>
                  <VerticalSpace space="2" />
                  <FormControl>
                    <Input placeholder="search for recipes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            ></FormField>
            <VerticalSpace space="8" />
            <Button type="submit">Search</Button>
          </form>
        </Form>
        <VerticalSpace space="8" />
        {results && (
          <div className="flex gap-5">
            <Card
              backgroundImage={recipes.recipes[0].imageUrl}
              heading={recipes.recipes[0].title}
              lead={recipes.recipes[0].description.slice(0, 10)}
              secondaryLead={recipes.recipes[0].tags[0]}
            />
            <Card
              backgroundImage={recipes.recipes[0].imageUrl}
              heading={recipes.recipes[0].title}
              lead={recipes.recipes[0].description.slice(0, 10)}
              secondaryLead={recipes.recipes[0].tags[0]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
