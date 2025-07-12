"use client";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export function RecipeActions() {
  const router = useRouter();

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex gap-4">
        <Button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Browse More Recipes
        </Button>
        <Button variant="outline" onClick={() => router.push("/favorites")}>
          View Favorites
        </Button>
      </div>
    </div>
  );
}
