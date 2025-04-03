import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface UserContextType {
  userRole: string | null;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  userRole: null,
  isLoading: true,
  error: null
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true
        });
        setUserRole(response.data.role);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao carregar dados do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserContext.Provider value={{ userRole, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}; 