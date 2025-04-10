import React from 'react';
import './CustomInput.css';

interface CustomInputProps {
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  isDarkMode?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  isDarkMode,
  disabled,
  id,
  name,
  required,
  pattern,
  maxLength
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`custom-input ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      disabled={disabled}
      id={id}
      name={name}
      required={required}
      pattern={pattern}
      maxLength={maxLength}
    />
  );
};

export default CustomInput;