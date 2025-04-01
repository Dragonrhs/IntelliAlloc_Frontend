import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Suitability from './pages/Suitability';
import Management from './pages/Management';
import ClientDetails from './pages/ClientDetails';
import ClientsList from './pages/ClientsList';
import History from './pages/History';
import SystemHistory from './pages/SystemHistory';
import RecommendedPortfolio from './pages/RecommendedPortfolio';
import ViewRecommendedPortfolio from './pages/ViewRecommendedPortfolio';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/suitability" element={<Suitability />} />
          <Route path="/suitability/:clientId" element={<Suitability />} />
          <Route path="/management" element={<Management />} />
          <Route path="/client/:clientId" element={<ClientDetails />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/history" element={<History />} />
          <Route path="/system-history" element={<SystemHistory />} />
          <Route path="/recommended-portfolio" element={<RecommendedPortfolio />} />
          <Route path="/view-recommended-portfolio" element={<ViewRecommendedPortfolio />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;