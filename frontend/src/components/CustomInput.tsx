import React from 'react';
import './CustomInput.css';

interface CustomInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
  isDarkMode?: boolean; // Adicionada prop para modo escuro/claro
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  label,
  className,
  isDarkMode,
}) => {
  return (
    <div className={`custom-input ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field ${className || ''}`}
      />
    </div>
  );
};

export default CustomInput;