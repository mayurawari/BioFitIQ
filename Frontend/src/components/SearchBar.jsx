import React from "react";

// Renders array of { name: string } and emits value as the name string
export const SearchBar = ({
  label = "",
  placeholder = "Select",
  options = [],         // expects [{ name: "abs" }, ...]
  disabled = false,
  value = "",
  onChange = () => {},
  id = "",
  name = "",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-white/80 text-sm">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-white/10 bg-black/70 px-4 py-2 text-white outline-none ring-1 ring-transparent focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={opt?.name ?? i} value={opt?.name ?? ""}>
            {opt?.name ?? ""}
          </option>
        ))}
      </select>
    </div>
  );
};
