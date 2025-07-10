"use client";
import { Text } from "@/src/components/ui/Text";
import { Session } from "@/src/types";
import { Heading } from "../heading/heading";
import { VerticalSpace } from "../ui/VerticalSpace";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useMemo } from "react";
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
import { useDebounce } from "@/src/hooks/use-debounce";
import { Card } from "../card/card";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RecipeResponse } from "@/src/types/recipes.types";

interface Props {
  session: Session | null;
}

type FormValues = {
  search: string;
};
const formSchema = z.object({
  search: z.string().min(3, "must be more than 3 letters long"),
});

export const Recipes = ({ session }: Props) => {
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const raw = form.watch("search");

  const debounced = useDebounce(raw, 500);

  const {
    data: recipes = { data: [], count: 0, search: "" },
    isLoading,
    isError,
  } = useQuery<RecipeResponse>({
    queryKey: ["recipes", debounced],
    queryFn: async () => {
      const url = new URL("/api/recipes", window.location.origin);
      if (debounced.length >= 3) {
        url.searchParams.set("search", debounced);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      return res.json() as Promise<RecipeResponse>;
    },
    enabled: debounced.length === 0 || debounced.length >= 3,
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Failed to load recipes</div>;

  return (
    <div className="mx-auto lg:w-4xl">
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
        <div className=" flex gap-5 flex-wrap">
          {recipes.data.length === 0 ? (
            <Text as="h1">No recipes found for {debounced}</Text>
          ) : (
            recipes.data.map((recipe) => (
              <Card
                key={recipe.id}
                backgroundImage={recipe.imageUrl}
                heading={recipe.title}
                lead={recipe.description.slice(0, 10)}
                secondaryLead={recipe.tags[0]}
                onClick={() => router.push(`/recipes/category/${recipe.title}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
