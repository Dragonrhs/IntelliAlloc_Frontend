import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  role: string | undefined; 
  setRole: (role: string) => void;
  isBackgroundAnimationEnabled: boolean;
  toggleBackgroundAnimation: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [isBackgroundAnimationEnabled, setIsBackgroundAnimationEnabled] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleBackgroundAnimation = () => {
    setIsBackgroundAnimationEnabled(!isBackgroundAnimationEnabled);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      isSidebarExpanded, 
      toggleSidebar, 
      role, 
      setRole,
      isBackgroundAnimationEnabled,
      toggleBackgroundAnimation
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};