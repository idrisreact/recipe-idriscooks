import Image from "next/image";
import { JourneySteps } from "./JourneySteps";

export const AboutSection = () => {
  return (
    <section
      className="flex flex-col items-center py-16 px-4 bg-gradient-to-br from-white to-gray-100"
      aria-labelledby="about-title"
    >
      <header className="flex flex-col md:flex-row items-center max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 gap-8 mb-12">
        {/* Image */}
        <figure className="flex-shrink-0">
          <Image
            src="/images/idriscooks-cartoon.png"
            alt="Idris Cooks Cartoon"
            width={180}
            height={180}
            className="rounded-2xl border-4 border-red-200 shadow-md object-cover bg-gray-50"
            priority
          />
        </figure>
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h1
            id="about-title"
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2"
          >
            Idris Taiwo
          </h1>
          <span className="text-lg text-red-400 font-semibold mb-4">
            Chef & Recipe Creator
          </span>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Welcome to my kitchen! I’m passionate about making cooking fun,
            accessible, and delicious for everyone. Whether you’re a beginner or
            a seasoned chef, you’ll find inspiration, tips, and a world of
            flavors here. Let’s cook something amazing together!
          </p>
        </div>
      </header>
      <JourneySteps />
    </section>
  );
};

export default AboutSection;
