import { CtaButton } from "../ui/cta-button";

type AboutSectionProps = {
  title: string;
  lead: string;
};

export const AboutSection = ({ title, lead }: AboutSectionProps) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl text-red-400 lg:text-5xl">{title}</h1>
      <p className="leading-8">{lead}</p>
      <CtaButton>Join</CtaButton>
    </div>
  );
};
