import { Text } from '@/src/components/ui/Text';
import { ChevronRightIcon } from '@radix-ui/react-icons';

type CategoryTitleProps = {
  title: string;
  onClick?: () => void;
};

export const CategoryTitle = ({ title, onClick }: CategoryTitleProps) => {
  return (
    <button
      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
      onClick={onClick}
      aria-label={`View ${title} category`}
    >
      <div className="flex gap-1 items-center">
        <Text as="h1" className="text-2xl font-bold">
          {title}
        </Text>
        <span aria-hidden="true">
          <ChevronRightIcon scale={1} />
        </span>
      </div>
    </button>
  );
};
