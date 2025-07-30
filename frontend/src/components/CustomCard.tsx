import React from 'react';
import './CustomCard.css';

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean; // Adicionada prop para modo escuro/claro
  title?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className, isDarkMode, title }) => {
  return (
    <div className={`custom-card ${className || ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {title && <h2 className="custom-card-title">{title}</h2>}
      {children}
    </div>
  );
};

export default CustomCard;