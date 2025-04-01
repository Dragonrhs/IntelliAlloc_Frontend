import React from 'react';
import './CustomButton.css';

interface CustomButtonProps {
  onClick: () => void;
  isDarkMode: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  children, 
  onClick, 
  className, 
  isDarkMode,
  disabled 
}) => {
  return (
    <button
      className={`custom-button ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;