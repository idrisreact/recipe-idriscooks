"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const journeyStepsData = [
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

export const JourneySteps = () => {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    imageRefs.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRefs.current[i],
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      className="w-full md:w-4/5 mx-auto px-4 md:px-60 wrapper"
      aria-labelledby="journey-title"
    >
      <h2
        id="journey-title"
        className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
      >
        My Journey
      </h2>
      <div className="flex flex-col ">
        {journeyStepsData.map((step, i) => (
          <article
            key={i}
            className="
              flex flex-col gap-5 md:flex-row 
              items-center justify-center 
              py-16 md:py-0 
              md:min-h-[75vh]
            "
            aria-label={step.title}
          >
            {/* Image */}
            <figure
              className="flex-1 flex justify-center md:justify-start mb-8 md:mb-0 opacity-0"
              ref={(el: HTMLDivElement | null) => {
                imageRefs.current[i] = el;
              }}
            >
              <Image
                src={step.image}
                alt={step.alt}
                width={400}
                height={400}
                className="rounded-2xl border-4 border-red-200 shadow-lg object-cover bg-gray-50 max-h-60 md:max-h-[40vh] w-auto md:mr-8"
              />
            </figure>
            {/* Text */}
            <div
              className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-0 opacity-0"
              ref={(el: HTMLDivElement | null) => {
                textRefs.current[i] = el;
              }}
            >
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-md">
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
