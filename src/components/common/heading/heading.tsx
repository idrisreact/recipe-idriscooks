import { Text } from "@/src/components/ui/Text";

type HeadingProps = {
  title: string;
  subTitle?: string;
};

export const Heading = ({ title, subTitle }: HeadingProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Text as="h1" className="text-4xl">
        {title}
      </Text>
      {subTitle && (
        <Text as="p" opacity="50">
          {subTitle}
        </Text>
      )}
    </div>
  );
};
