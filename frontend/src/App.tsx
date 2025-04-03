import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;