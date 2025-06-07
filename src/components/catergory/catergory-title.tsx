import { Text } from "../ui/Text";
import { ChevronRightIcon } from "@radix-ui/react-icons";

type CategoryTitleProps = {
  title: string;
  onClick?: () => void;
};

export const CategoryTitle = ({ title, onClick }: CategoryTitleProps) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      <div className="flex gap-1 items-center">
        <Text as="h1" className="text-2xl font-bold">
          {title}
        </Text>
        <span>
          <ChevronRightIcon scale={1} />
        </span>
      </div>
    </button>
  );
};
