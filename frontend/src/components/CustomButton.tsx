import React from 'react';
import './CustomButton.css';

interface CustomButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  isDarkMode?: boolean; // Adicionada prop para modo escuro/claro
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, onClick, className, isDarkMode }) => {
  return (
    <button
      className={`custom-button ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CustomButton;