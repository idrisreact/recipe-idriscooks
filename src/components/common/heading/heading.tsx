type HeadingProps = {
  title: string;
  subTitle?: string;
};

/** Editorial page heading: serif display title, muted standfirst, ink rule. */
export const Heading = ({ title, subTitle }: HeadingProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="display-s">{title}</h1>
      {subTitle && <p className="body-lg text-[var(--ink-65)] max-w-2xl">{subTitle}</p>}
      <div className="divider" />
    </div>
  );
};
