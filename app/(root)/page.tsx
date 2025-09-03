import Image from "next/image";
import { BouncingText } from "@/src/components/hero-animation-text/hero-animation-text";
import HeroButtons from "@/src/components/ui/HeroButtons";
import FeaturesSection from "@/src/components/features-section";

export default function Home() {
  return (
    <>
      {/* Hero Section with Logo and Headline */}
      <div
        className="min-h-[100vh] flex items-center justify-center relative bg-cover bg-center bg-no-repeat w-full px-4 sm:px-6"
        style={{ backgroundImage: "url('/images/food background.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="wrapper flex flex-col items-center justify-center relative z-10 text-center py-20">
          <Image
            src="/images/idriscooks-logo.png"
            alt="idris-cooks-logo"
            width={200}
            height={200}
            className="z-10 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-6"
            quality={75}
          />
          <BouncingText>
            <span className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight max-w-4xl block text-center mb-2">
              Elevate Your Kitchen
            </span>
          </BouncingText>
          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Where Every Meal Becomes a Masterpiece
          </p>
          <HeroButtons />
        </div>
      </div>

      <FeaturesSection />
    </>
  );
}
