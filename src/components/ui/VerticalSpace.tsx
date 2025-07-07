type VerticalSpaceType = "2" | "6" | "8" | "12" | "16" | "24" | "32";

const SPACE_CLASS: Record<VerticalSpaceType, string> = {
  "2": "my-2",
  "6": "my-6",
  "8": "my-8",
  "12": "my-12",
  "16": "my-16",
  "24": "my-24",
  "32": "my-32",
};

export const VerticalSpace = ({ space }: { space: VerticalSpaceType }) => {
  return <div className={SPACE_CLASS[space]} />;
};
