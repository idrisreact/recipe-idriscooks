import FeatureImageCard from "./card/feature-image-card";
import FeatureQuoteCard from "./card/feature-quote-card";
import FeatureInfoCard from "./card/feature-info-card";
import { FaMedal, FaVideo, FaUtensils } from "react-icons/fa";

export default function FeaturesSection() {
  return (
    <section className="wrapper my-16 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
        Become a true <span className="text-yellow-500">chef</span> with our
        recipes.
      </h2>
      <p className="text-gray-500 text-center mb-10 max-w-xl">
        We are a home to variety of recipes worldwide for you to learn.
      </p>
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
        <FeatureImageCard
          label="Easy to follow recipes"
          badge="Step #1"
          bgColor="bg-gray-200"
        />
        <FeatureQuoteCard
          quote="Cooking has never been this easy!"
          author="Marsha Rianty"
        />
        <FeatureInfoCard
          items={[
            {
              icon: <FaMedal />,
              label: "Achievement",
              value: "Cook 2 foods today",
            },
            {
              icon: <FaVideo />,
              label: "Live Now",
              value: "Chef Idris Cooks",
            },
            {
              icon: <FaUtensils />,
              label: "Today's Recipe",
              value: "Spaghetti Bolognese",
            },
          ]}
        />
        <FeatureImageCard
          overlayText="Cook with Master Chefs"
          badge="LIVE"
          bgColor="bg-yellow-100"
        />
      </div>
    </section>
  );
}
