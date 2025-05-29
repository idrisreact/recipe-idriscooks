import { AboutSection } from "@/src/components/about-section/about-section";
import { BouncingText } from "@/src/components/hero-animation-text/hero-animation-text";
import { Container } from "@/src/components/ui/Container";
import { ScrollIndicator } from "@/src/components/ui/scroll-component";
import { VerticalSpace } from "@/src/components/ui/VerticalSpace";
import { authClient } from "@/src/utils/auth-client";
import Image from "next/image";

export default function Home() {
  authClient.getSession;
  return (
    <div>
      <Container>
        <div className="h-[80vh] mt-16 flex items-center flex-col md:flex-row">
          <Image
            src="/images/idriscooks-logo.png"
            alt="idris-cooks-logo"
            width={400}
            height={400}
          />
          <BouncingText />
          <ScrollIndicator />
        </div>
        <VerticalSpace space="16" />
        <AboutSection
          title="About"
          lead="Hello there! My name is Idris, and I’ve been making TikTok videos since the start of the pandemic. I love sharing my food recipes and exploring different cultures’ cuisines. I’ve created this website to provide a step-by-step guide on how to recreate my recipes. So, you can enjoy these delicious dishes right from the comfort of your own home!"
        />
      </Container>
    </div>
  );
}
