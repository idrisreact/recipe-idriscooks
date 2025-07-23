import Image from "next/image";
import { FaHeart } from "react-icons/fa";

interface FeatureQuoteCardProps {
  quote: string;
  author: string;
  avatar?: string;
}

export default function FeatureQuoteCard({
  quote,
  author,
  avatar,
}: FeatureQuoteCardProps) {
  return (
    <div className="relative w-64 h-80 rounded-2xl bg-yellow-400 flex flex-col justify-between p-6 shadow-md">
      <span className="absolute top-3 right-3 text-white text-xl">
        <FaHeart />
      </span>
      <blockquote className="text-white text-2xl font-semibold leading-snug flex-1 flex items-center">
        “{quote}”
      </blockquote>
      <div className="flex items-center gap-3 mt-4">
        {avatar && (
          <Image
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
        )}
        <div className="text-white text-sm font-medium">{author}</div>
      </div>
    </div>
  );
}
