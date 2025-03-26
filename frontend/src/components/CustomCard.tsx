import React from 'react';
import './CustomCard.css';

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean; // Adicionada prop para modo escuro/claro
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className, isDarkMode }) => {
  return (
    <div className={`custom-card ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {children}
    </div>
  );
};

export default CustomCard;