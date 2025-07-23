interface FeatureImageCardProps {
  bgColor?: string;
  label?: string;
  badge?: string;
  overlayText?: string;
}

export default function FeatureImageCard({
  bgColor = "bg-gray-200",
  label,
  badge,
  overlayText,
}: FeatureImageCardProps) {
  return (
    <div
      className={`relative w-64 h-80 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end items-center ${bgColor}`}
    >
      {badge && (
        <span className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
          {badge}
        </span>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 bg-white/80 text-gray-800 text-xs px-3 py-1 rounded-full font-medium z-10">
          {label}
        </span>
      )}
      {overlayText && (
        <span className="absolute bottom-8 left-3 right-3 text-gray-800 text-lg font-bold drop-shadow-lg z-10 text-center">
          {overlayText}
        </span>
      )}
    </div>
  );
}
