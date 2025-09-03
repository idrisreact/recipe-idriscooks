import Image from "next/image";
import { JourneySteps } from "./JourneySteps";
import { Text } from "@/src/components/ui/Text";

export const AboutSection = () => {
  return (
    <section
      className="flex flex-col items-center py-16 px-4 min-h-screen"
      aria-labelledby="about-title"
    >
      <div className="wrapper">
        <header className="flex flex-col md:flex-row items-center max-w-4xl w-full murakamicity-card p-8 gap-8 mb-16">
          {/* Image */}
          <figure className="flex-shrink-0">
            <Image
              src="/images/idriscooks-cartoon.png"
              alt="Idris Cooks Cartoon"
              width={200}
              height={200}
              className="rounded-xl border-2 border-primary/20 shadow-lg object-cover bg-muted"
              priority
            />
          </figure>
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Text
              as="h1"
              id="about-title"
              variant="heading"
              className="mb-4"
            >
              Idris Taiwo
            </Text>
            <Text 
              variant="large" 
              className="text-primary font-semibold mb-6"
            >
              Chef & Recipe Creator
            </Text>
            <Text 
              variant="large" 
              className="text-muted-foreground leading-relaxed"
            >
              Welcome to my kitchen! I&apos;m passionate about making cooking fun,
              accessible, and delicious for everyone. Whether you&apos;re a beginner or
              a seasoned chef, you&apos;ll find inspiration, tips, and a world of
              flavors here. Let&apos;s cook something amazing together!
            </Text>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8 text-center">
              <div className="flex flex-col">
                <Text variant="large" className="font-bold text-primary">17K+</Text>
                <Text className="text-muted-foreground">Followers</Text>
              </div>
              <div className="flex flex-col">
                <Text variant="large" className="font-bold text-primary">100+</Text>
                <Text className="text-muted-foreground">Recipes</Text>
              </div>
              <div className="flex flex-col">
                <Text variant="large" className="font-bold text-primary">8+</Text>
                <Text className="text-muted-foreground">Years Cooking</Text>
              </div>
            </div>
          </div>
        </header>
        <JourneySteps />
      </div>
    </section>
  );
};

export default AboutSection;
