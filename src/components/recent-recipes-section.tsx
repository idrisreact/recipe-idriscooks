"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Text } from "@/src/components/ui/Text";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ActionButton } from "@/src/components/ui/ActionButton";
import { Heart, Eye, Share2, Clock, Users } from "lucide-react";
import { useFavorites } from "@/src/hooks/use-favorites";

interface RecentRecipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  image_url?: string;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  createdAt?: string;
}

export default function RecentRecipesSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const recipeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const {
    data: recipes,
    isLoading,
    error,
  } = useQuery<RecentRecipe[]>({
    queryKey: ["recent-recipes"],
    queryFn: async () => {
      const response = await fetch("/api/recipes?limit=6&sort=recent");
      if (!response.ok) {
        throw new Error("Failed to fetch recent recipes");
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Animate section heading
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        {
          autoAlpha: 0,
          y: 50,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Animate recipe cards with stagger effect
    recipeRefs.current.forEach((el, index) => {
      if (!el) return;

      gsap.fromTo(
        el,
        {
          autoAlpha: 0,
          y: 60,
          scale: 0.9,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.1, // Stagger animation
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [recipes]);

  const handleToggleFavorite = async (
    recipeId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (isFavorited(recipeId)) {
      await removeFromFavorites(recipeId);
    } else {
      await addToFavorites(recipeId);
    }
  };

  const handleShare = (recipe: RecentRecipe, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${
      window.location.origin
    }/recipes/category/${encodeURIComponent(recipe.title)}`;
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url,
      });
    } else {
      navigator.clipboard.writeText(`${recipe.title} - ${url}`);
    }
  };

  const handlePreview = (recipe: RecentRecipe, e: React.MouseEvent) => {
    e.stopPropagation();
    // Here you could open a preview modal or navigate
    router.push(`/recipes/category/${encodeURIComponent(recipe.title)}`);
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} className="wrapper my-16">
        <div className="text-center mb-12">
          <Text as="h2" variant="heading" className="mb-4">
            Recent Recipes
          </Text>
          <Text
            variant="large"
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Discover our latest culinary creations
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="murakamicity-card p-6 animate-pulse">
              <div className="h-48 bg-muted rounded-sm mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !recipes?.length) {
    return null;
  }

  return (
    <section ref={sectionRef} className="wrapper my-20">
      {/* Section Heading */}
      <div ref={headingRef} className="text-center mb-12 opacity-0">
        <Text as="h2" variant="heading" className="mb-4">
          Recent Recipes
        </Text>
        <Text
          variant="large"
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          Discover our latest culinary creations, fresh from the kitchen
        </Text>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe, index) => {
          const imageUrl =
            recipe.imageUrl || recipe.image_url || "/images/default-recipe.jpg";
          const favorited = isFavorited(recipe.id);

          return (
            <div
              key={recipe.id}
              ref={(el) => {
                recipeRefs.current[index] = el;
              }}
              className="group cursor-pointer opacity-0"
              onClick={() =>
                router.push(
                  `/recipes/category/${encodeURIComponent(recipe.title)}`
                )
              }
            >
              <div className="murakamicity-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                {/* Recipe Image */}
                <div
                  className="relative h-48 bg-cover bg-center bg-muted"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Action Buttons - appear on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ActionButton
                      icon={Heart}
                      isActive={favorited}
                      activeColor="text-primary"
                      ariaLabel={`${
                        favorited ? "Remove from" : "Add to"
                      } favorites`}
                      onClick={(e) => handleToggleFavorite(recipe.id, e)}
                      className="bg-background/90 hover:bg-background"
                    />
                    <ActionButton
                      icon={Share2}
                      ariaLabel="Share recipe"
                      onClick={(e) => handleShare(recipe, e)}
                      className="bg-background/90 hover:bg-background"
                    />
                    <ActionButton
                      icon={Eye}
                      ariaLabel="Preview recipe"
                      onClick={(e) => handlePreview(recipe, e)}
                      className="bg-background/90 hover:bg-background"
                    />
                  </div>

                  {/* Recipe Meta - overlay on bottom */}
                  {(recipe.cookTime || recipe.servings) && (
                    <div className="absolute bottom-3 left-3 flex gap-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {recipe.cookTime && (
                        <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {recipe.cookTime}m
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3" />
                          {recipe.servings}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                  <Text
                    as="h3"
                    variant="large"
                    className="font-semibold mb-2 line-clamp-2"
                  >
                    {recipe.title}
                  </Text>
                  <Text className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {recipe.description}
                  </Text>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {recipe.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{recipe.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => router.push("/recipes")}
          className="murakamicity-button-outline hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          View All Recipes
        </button>
      </div>
    </section>
  );
}
