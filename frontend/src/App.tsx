import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes'; 
import { ThemeProvider } from './context/ThemeContext'; 

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes /> 
      </Router>
    </ThemeProvider>
  );
};

export default App;