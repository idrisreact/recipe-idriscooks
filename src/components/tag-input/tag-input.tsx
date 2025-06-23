import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  FC,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { VerticalSpace } from "../ui/VerticalSpace";

interface TagInputProps
  extends Omit<HTMLAttributes<HTMLInputElement>, "onChange"> {
  hasBorder: boolean;
  onChange: (value: string) => void;
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required: boolean;
  onAdd: (tag: string) => void;
  onDelete: (id: number) => void;
  tags: string[];
}

export const TagInput: FC<TagInputProps> = ({
  hasBorder,
  className,
  onChange,
  onAdd,
  label,
  name,
  placeholder,
  value,
  required,
  onDelete,
  tags,
  ...props
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyChange = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const trimmed = value.trim();
      if (trimmed) {
        onAdd(trimmed);
        onChange("");
      }
    }
  };

  const handleDelete = (index: number) => (e: MouseEvent<HTMLDivElement>) => {
    onDelete(index);
  };
  return (
    <div className="flex flex-col w-2xs">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type="text"
        onChange={handleChange}
        onKeyDown={handleKeyChange}
        name={name}
        required={required}
        placeholder={placeholder}
        className={cn(className, "p-2 rounded-md border-black", {
          border: hasBorder,
        })}
        value={value}
        {...props}
      />
      <VerticalSpace space="6" />
      <div className="flex flex-col gap-3">
        {tags.length > 0 &&
          tags.map((tag, index) => (
            <div
              key={index}
              onClick={handleDelete(index)}
              className="bg-blue-800 rounded-2xl px-2 py-1 text-white cursor-pointer"
            >
              <p>{tag}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
