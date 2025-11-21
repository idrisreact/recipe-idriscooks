import Image from 'next/image';
import { BouncingText } from '@/src/components/hero-animation-text/hero-animation-text';
import HeroButtons from '@/src/components/ui/HeroButtons';
import FeaturesSection from '@/src/components/features-section';

export default function Home() {
  return (
    <>
      {}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: "url('/images/food background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background z-0" />
        </div>

        {/* Content */}
        <div className="wrapper relative z-10 flex flex-col items-center text-center pt-20 pb-32">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
            <Image
              src="/images/idriscooks-logo.png"
              alt="idris-cooks-logo"
              width={240}
              height={240}
              className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 mb-8 mx-auto drop-shadow-2xl"
              quality={90}
              priority
            />
          </div>
          
          <BouncingText>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-tight">
              Elevate Your Kitchen <br className="hidden sm:block" />
              <span className="text-primary">
                Masterpiece
              </span>
            </span>
          </BouncingText>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Where every meal becomes an unforgettable experience. Discover recipes, learn techniques, and cook with passion.
          </p>

          <div className="w-full max-w-md mx-auto">
            <HeroButtons />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg 
            className="w-6 h-6 text-white/70"
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <FeaturesSection />
    </>
  );
}
