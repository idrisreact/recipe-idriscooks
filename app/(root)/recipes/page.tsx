import { Recipes } from "@/src/components/recipe-server-component/recipes.server";
import { auth } from "@/src/utils/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default async function RecipePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      {/* Hero Section */}
      <section className="section-full relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/food background.png"
            alt="Culinary Collection"
            fill
            className="object-cover brightness-50"
            priority
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <div className="wrapper relative z-10 text-center">
          <h1 className="heading-hero text-white mb-8">
            The
            <br />
            <span className="text-gradient-primary">Collection</span>
          </h1>
          
          <p className="body-lg max-w-2xl mx-auto mb-12">
            Explore our curated selection of recipes. From quick weeknight meals to 
            culinary masterpieces, find your next inspiration here.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Recipes Section */}
      <section className="bg-black min-h-screen py-24">
        <div className="wrapper">
          <Recipes session={session} />
        </div>
      </section>
    </>
  );
}
