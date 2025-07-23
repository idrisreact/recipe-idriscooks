type DropDownProps = {
  data: { key: string; value: string }[];
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const DropDown = ({ data, label, onChange, value }: DropDownProps) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <select
        name={label}
        id={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {data.map(({ key, value }) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};
