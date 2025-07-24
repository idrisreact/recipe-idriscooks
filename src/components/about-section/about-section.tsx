import Image from "next/image";

const journeySteps = [
  {
    title: "Started Cooking at 13",
    description:
      "My journey with food began at age 13, when I first stepped into the kitchen alongside my mum. What started as curiosity quickly became a true passion. She taught me the basics — from cooking rice and mastering Nigerian stew to preparing dishes like jollof rice, egusi soup, and fried plantain. Those early days were filled with trial, error, laughter, and the joy of creating something from scratch.",
    image: "/images/idris-cooks-13.png",
    alt: "Idris at 13",
  },
  {
    title: "Paused During University",
    description:
      "Although I didn’t cook much during my university years, my love for food never faded. The spark stayed alive — waiting for the right time to reignite.",
    image: "/images/idriscookss-study.png",
    alt: "Idris studying at university",
  },
  {
    title: "First TikTok Video",
    description:
      "One day, I decided to share a simple cooking video on TikTok — and it unexpectedly took off with 400 likes. That moment reminded me why I fell in love with cooking in the first place. It felt like the beginning of something bigger.",
    image: "/images/idris-cooks-content.png",
    alt: "Idris making content",
  },
  {
    title: "Now: 17,000+ Followers",
    description:
      "Today, I’m proud to share my recipes, kitchen tips, and culture-inspired creations with a growing community of over 17,000 food lovers. Every comment, save, and share motivates me to keep creating and connecting through food. The journey is just getting started.",
    image: "/images/idris-tiktok.png",
    alt: "Idris on TikTok",
  },
];

export const AboutSection = () => {
  return (
    <section className="flex flex-col items-center py-16 px-4 bg-gradient-to-br from-white to-gray-100">
      <div className="flex flex-col md:flex-row items-center max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 gap-8 mb-12">
        {/* Image */}
        <div className="flex-shrink-0">
          <Image
            src="/images/idriscooks-cartoon.png"
            alt="Idris Cooks Cartoon"
            width={180}
            height={180}
            className="rounded-2xl border-4 border-red-200 shadow-md object-cover bg-gray-50"
            priority
          />
        </div>
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Idris Taiwo
          </h2>
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
      </div>

      {/* Journey Slides */}
      <div className="w-full md:w-4/5 mx-auto px-4 md:px-60 wrapper">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          My Journey
        </h3>
        <div className="flex flex-col ">
          {journeySteps.map((step, i) => (
            <div
              key={i}
              className="
                flex flex-col gap-5 md:flex-row 
                items-center justify-center 
                py-16 md:py-0 
                md:min-h-[75vh]
              "
            >
              {/* Image */}
              <div className="flex-1 flex justify-center md:justify-start mb-8 md:mb-0">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  className="rounded-2xl border-4 border-red-200 shadow-lg object-cover bg-gray-50 max-h-60 md:max-h-[40vh] w-auto md:mr-8"
                />
              </div>

              {/* Text */}
              <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-0">
                <h4 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h4>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
