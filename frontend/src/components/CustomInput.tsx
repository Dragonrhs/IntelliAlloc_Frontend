import React from "react";

interface CustomInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ type, placeholder, value, onChange, label, className }) => {
  return (
    <div className="custom-input">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field ${className}`}
      />
    </div>
  );
};

export default CustomInput;
