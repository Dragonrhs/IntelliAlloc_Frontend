import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { LoadingProvider } from './context/LoadingContext';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <LoadingProvider>
          <Router>
            <AppRoutes />
          </Router>
        </LoadingProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;