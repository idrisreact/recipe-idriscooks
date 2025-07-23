import Image from "next/image";
import { BouncingText } from "@/src/components/hero-animation-text/hero-animation-text";
import { AboutSection } from "@/src/components/about-section/about-section";

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
          />
          <BouncingText>
            <span className="text-white w-full md:max-w-xl block text-center">
              Elevate Your Kitchen: Where Every Meal Becomes a Masterpiece
            </span>
          </BouncingText>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="page wrapper">
        <AboutSection
          title="About"
          lead="Hello there! My name is Idris, and I’ve been making TikTok videos since the start of the pandemic. I love sharing my food recipes and exploring different cultures’ cuisines. I’ve created this website to provide a step-by-step guide on how to recreate my recipes. So, you can enjoy these delicious dishes right from the comfort of your own home!"
        />
      </div>
    </>
  );
}
