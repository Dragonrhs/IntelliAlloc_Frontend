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
import Estatisticas from './pages/Estatisticas';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';

// Componente para proteger rotas que não devem ser acessadas por membros
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, isLoading } = useUser();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (userRole === 'Membro') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rotas que só podem ser acessadas por Admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, isLoading } = useUser();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (userRole !== 'Admin') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/suitability" element={<ProtectedRoute><Suitability /></ProtectedRoute>} />
            <Route path="/suitability/:clientId" element={<ProtectedRoute><Suitability /></ProtectedRoute>} />
            <Route path="/management" element={<AdminRoute><Management /></AdminRoute>} />
            <Route path="/client/:clientId" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientsList /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/system-history" element={<AdminRoute><SystemHistory /></AdminRoute>} />
            <Route path="/recommended-portfolio" element={<AdminRoute><RecommendedPortfolio /></AdminRoute>} />
            <Route path="/view-recommended-portfolio" element={<ProtectedRoute><ViewRecommendedPortfolio /></ProtectedRoute>} />
            <Route path="/estatisticas" element={<AdminRoute><Estatisticas /></AdminRoute>} />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;