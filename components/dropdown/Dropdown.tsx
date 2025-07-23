type DropDownOption = {
  key: string;
  value: string;
};

type DropDownProps = {
  data: DropDownOption[];
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const DropDown = ({
  data,
  label,
  onChange,
  value,
  id,
}: DropDownProps) => {
  const selectId = id || `dropdown-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={selectId}>{label}</label>
      <select
        name={selectId}
        id={selectId}
        value={value}
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
