import { HtmlHTMLAttributes } from "react";

type DropDownProps<D> = {
  data: { key: string; value: D }[];
  value: string;
  label: string;
  selectId: string;
} & HtmlHTMLAttributes<HTMLSelectElement>;

export const DropDown = <D,>({
  data,
  label,
  selectId,
  ...props
}: DropDownProps<D>) => {
  return (
    <label htmlFor={selectId}>
      {label}
      <select id={selectId} {...props}>
        <option value="" disabled>
          --Select and option--
        </option>
        {data.map(({ key, value }) => (
          <option value={String(value)} key={String(value)}>
            {key}
          </option>
        ))}
      </select>
    </label>
  );
};
