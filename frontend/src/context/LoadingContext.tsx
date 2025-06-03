import React, { createContext, useContext, useState, ReactNode } from 'react';
import Loading from '../components/Loading';

interface LoadingContextData {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextData>({} as LoadingContextData);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Carregando...');

  const showLoading = (customMessage?: string) => {
    if (customMessage) {
      setMessage(customMessage);
    }
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading: loading, showLoading, hideLoading }}>
      {children}
      {loading && <Loading message={message} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 