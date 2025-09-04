'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Text } from '@/src/components/ui/Text';

const journeyStepsData = [
  {
    title: 'Started Cooking at 13',
    description:
      'My journey with food began at age 13, when I first stepped into the kitchen alongside my mum. What started as curiosity quickly became a true passion. She taught me the basics — from cooking rice and mastering Nigerian stew to preparing dishes like jollof rice, egusi soup, and fried plantain. Those early days were filled with trial, error, laughter, and the joy of creating something from scratch.',
    image: '/images/idris-cooks-13.png',
    alt: 'Idris at 13',
  },
  {
    title: 'Paused During University',
    description:
      'Although I didn’t cook much during my university years, my love for food never faded. The spark stayed alive — waiting for the right time to reignite.',
    image: '/images/idriscookss-study.png',
    alt: 'Idris studying at university',
  },
  {
    title: 'First TikTok Video',
    description:
      'One day, I decided to share a simple cooking video on TikTok — and it unexpectedly took off with 400 likes. That moment reminded me why I fell in love with cooking in the first place. It felt like the beginning of something bigger.',
    image: '/images/idris-cooks-content.png',
    alt: 'Idris making content',
  },
  {
    title: 'Now: 17,000+ Followers',
    description:
      'Today, I’m proud to share my recipes, kitchen tips, and culture-inspired creations with a growing community of over 17,000 food lovers. Every comment, save, and share motivates me to keep creating and connecting through food. The journey is just getting started.',
    image: '/images/idris-tiktok.png',
    alt: 'Idris on TikTok',
  },
];

export const JourneySteps = () => {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
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
          ease: 'power2.out',
          scrollTrigger: {
            trigger: imageRefs.current[i],
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto px-4" aria-labelledby="journey-title">
      <Text as="h2" id="journey-title" variant="heading" className="mb-16 text-center">
        My Journey
      </Text>
      <div className="flex flex-col space-y-24">
        {journeyStepsData.map((step, i) => (
          <article
            key={i}
            className={`
              flex flex-col gap-8 md:gap-12
              items-center justify-center
              ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}
            `}
            aria-label={step.title}
          >
            {}
            <figure
              className="flex-1 flex justify-center opacity-0"
              ref={(el: HTMLDivElement | null) => {
                imageRefs.current[i] = el;
              }}
            >
              <div className="murakamicity-card p-6 max-w-md">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={400}
                  height={400}
                  className="rounded-lg border-2 border-primary/20 shadow-lg object-cover bg-muted w-full h-auto"
                />
              </div>
            </figure>
            {}
            <div
              className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-4 md:px-8 opacity-0"
              ref={(el: HTMLDivElement | null) => {
                textRefs.current[i] = el;
              }}
            >
              <div className="murakamicity-card p-8 max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="h-px bg-primary/30 flex-1"></div>
                </div>

                <Text as="h3" variant="subheading" className="mb-6 text-primary">
                  {step.title}
                </Text>
                <Text variant="large" className="text-muted-foreground leading-relaxed">
                  {step.description}
                </Text>
              </div>
            </div>
          </article>
        ))}
      </div>

      {}
      <div className="mt-24 text-center">
        <div className="murakamicity-card p-8 max-w-2xl mx-auto">
          <Text variant="subheading" className="mb-4 text-primary">
            Ready to Cook Together?
          </Text>
          <Text variant="large" className="text-muted-foreground mb-6">
            Join me on this culinary adventure! Follow along for new recipes, cooking tips, and
            behind-the-scenes kitchen moments.
          </Text>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://tiktok.com/@idriscooks"
              target="_blank"
              rel="noopener noreferrer"
              className="murakamicity-button flex items-center gap-2"
            >
              Follow on TikTok
            </a>
            <a href="/recipes" className="murakamicity-button-outline flex items-center gap-2">
              Browse Recipes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
