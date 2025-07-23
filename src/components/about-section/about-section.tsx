import { CtaButton } from "../ui/cta-button";

interface AboutSectionProps {
  title: string;
  lead: string;
}

export const AboutSection = ({ title, lead }: AboutSectionProps) => {
  return (
    <section
      className="flex flex-col items-center gap-8"
      aria-labelledby="about-title"
    >
      <h2
        id="about-title"
        className="text-3xl text-red-400 lg:text-5xl font-bold"
      >
        {title}
      </h2>
      <p className="leading-8 text-center max-w-2xl">{lead}</p>
    </section>
  );
};
