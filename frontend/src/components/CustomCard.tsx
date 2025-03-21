import React from "react";

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className }) => {
  return <div className={`custom-card ${className}`}>{children}</div>;
};

export default CustomCard;
