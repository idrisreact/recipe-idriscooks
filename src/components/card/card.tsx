"use client";

type CardProps = {
  backgroundImage: string;
  heading: string;
  avatar?: string;
  lead: string;
  secondaryLead: string;
  onCLick?: () => void;
};

export const Card = ({
  backgroundImage,
  heading,
  avatar,
  lead,
  secondaryLead,
  onCLick,
}: CardProps) => {
  return (
    <article
      className="relative w-64 h-80 rounded-lg overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      aria-label={heading}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h2 className="text-lg font-semibold">{heading}</h2>

        <div className="mt-2 flex items-center space-x-2">
          {avatar && (
            <img
              src={avatar}
              alt={lead}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{lead}</span>
            <span className="text-xs opacity-80">{secondaryLead}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
