"use client";

import FeatureQuoteCard from "./card/feature-quote-card";
import FeatureInfoCard from "./card/feature-info-card";
import { FaMedal, FaVideo, FaUtensils } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { useRouter } from "next/navigation";

function MostPopularRecipes() {
  interface PopularRecipe {
    id: number;
    title: string;
    description: string;
    image_url: string;
    tags?: string[];
    favoriteCount: number;
  }
  const [recipes, setRecipes] = useState<PopularRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPopular() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recipes/popular");
        const data = await res.json();
        setRecipes(data.data || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Failed to load popular recipes");
        } else {
          setError("Failed to load popular recipes");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  if (loading)
    return <div className="my-8 text-center">Loading popular recipes...</div>;
  if (error)
    return <div className="my-8 text-center text-red-500">{error}</div>;
  if (!recipes.length) return null;

  return (
    <section className="wrapper my-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Most Popular Recipes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="relative cursor-pointer"
            onClick={() =>
              router.push(
                `/recipes/category/${encodeURIComponent(recipe.title)}`
              )
            }
          >
            <Card
              variant="recipe"
              backgroundImage={recipe.image_url}
              title={recipe.title}
              subtitle={recipe.description?.slice(0, 50) + "..."}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FeaturesSection() {
  return (
    <>
      <MostPopularRecipes />
      <section className="wrapper my-16 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          Become a true <span className="text-yellow-500">chef</span> with our
          recipes.
        </h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl">
          We are a home to variety of recipes worldwide for you to learn.
        </p>
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
          <Card
            variant="feature"
            label="Easy to follow recipes"
            badge="Step #1"
            bgColor="bg-gray-200"
          />
          <FeatureQuoteCard
            quote="Cooking has never been this easy!"
            author="Marsha Rianty"
          />
          <FeatureInfoCard
            items={[
              {
                icon: <FaMedal />,
                label: "Achievement",
                value: "Cook 2 foods today",
              },
              {
                icon: <FaVideo />,
                label: "Live Now",
                value: "Chef Idris Cooks",
              },
              {
                icon: <FaUtensils />,
                label: "Today's Recipe",
                value: "Spaghetti Bolognese",
              },
            ]}
          />
          <Card
            variant="feature"
            overlayText="Cook with Master Chefs"
            badge="LIVE"
            bgColor="bg-yellow-100"
          />
        </div>
      </section>
    </>
  );
}
