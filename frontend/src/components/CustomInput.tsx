import React from 'react';
import './CustomInput.css';

interface CustomInputProps {
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  isDarkMode?: boolean;
  disabled?: boolean;
  id?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className,
  isDarkMode,
  disabled,
  id
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`custom-input ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      disabled={disabled}
      id={id}
    />
  );
};

export default CustomInput;