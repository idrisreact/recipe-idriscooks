import Image from "next/image";
import { BouncingText } from "@/src/components/hero-animation-text/hero-animation-text";
import HeroButtons from "@/src/components/ui/HeroButtons";
import FeaturesSection from "@/src/components/features-section";

export default function Home() {
  return (
    <>
      {/* Hero Section with Logo and Headline */}
      <div
        className="h-[80vh] flex items-center justify-center relative bg-cover bg-[position:right_top] sm:bg-center bg-no-repeat w-full"
        style={{ backgroundImage: "url('/images/food background.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40 z-0" />
        <div className="flex flex-col items-center justify-center relative z-10">
          <Image
            src="/images/idriscooks-logo.png"
            alt="idris-cooks-logo"
            width={220}
            height={220}
            className="z-10"
            quality={50}
          />
          <BouncingText>
            <span className="text-white w-full md:max-w-xl block text-center">
              Elevate Your Kitchen: Where Every Meal Becomes a Masterpiece
            </span>
          </BouncingText>
          <HeroButtons />
        </div>
      </div>

      <FeaturesSection />
    </>
  );
}
