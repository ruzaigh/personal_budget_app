import React from "react";

interface FormInputProps {
  type: "text" | "number" | "select";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const baseInputStyles =
  "shadow-sm appearance-none border border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed";

export const FormInput: React.FC<FormInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  options = [],
  className = "",
  min,
  max,
  disabled = false,
}) => {
  if (type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInputStyles} ${className}`}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${baseInputStyles} ${className}`}
      min={min}
      max={max}
      disabled={disabled}
    />
  );
};
