import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import InserirAtivo from './pages/InserirAtivo';
import AtualizarAtivo from './pages/AtualizarAtivo';
import ConsultarAtivos from './pages/ConsultarAtivos';
import { useUser } from './context/UserContext';

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

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { userRole, isLoading } = useUser();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { userRole, isLoading } = useUser();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* Rota para a página inicial (redireciona para /login se não autenticado) */}
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

      {/* Rota para login */}
      <Route path="/login" element={<Login />} />

      {/* Rota para registro */}
      <Route path="/register" element={<Register />} />

      {/* Rota para o formulário de suitability (adicionar/editar cliente) */}
      <Route path="/suitability" element={<ProtectedRoute><Suitability /></ProtectedRoute>} />
      <Route path="/suitability/:clientId" element={<ProtectedRoute><Suitability /></ProtectedRoute>} />

      {/* Rota para detalhes de um cliente específico */}
      <Route path="/client/:clientId" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />

      {/* Rota para a lista de clientes */}
      <Route path="/clients" element={<ProtectedRoute><ClientsList /></ProtectedRoute>} />

      {/* Rota para o histórico */}
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

      {/*Rota para o histórico do sistema */}
      <Route path="/system-history" element={<AdminRoute><SystemHistory /></AdminRoute>} />

      {/* Rota para gerenciamento de usuários */}
      <Route path="/management" element={<AdminRoute><Management /></AdminRoute>} />

      {/* Rota para recomendação de portfólio */}
      <Route path="/recommended-portfolio" element={<AdminRoute><RecommendedPortfolio /></AdminRoute>} />

      {/* Rota para visualização de recomendação de portfólio */}
      <Route path="/view-recommended-portfolio" element={<ProtectedRoute><ViewRecommendedPortfolio /></ProtectedRoute>} />

      {/* Rota para estatísticas */}
      <Route path="/estatisticas" element={<ProtectedRoute><Estatisticas /></ProtectedRoute>} />

      {/* Rota para inserir ativo */}
      <Route path="/inserir-ativo" element={
        <ProtectedRoute>
          {userRole === 'Admin' || userRole === 'Research' ? (
            <InserirAtivo />
          ) : (
            <div className="access-denied">
              <h2>Acesso Negado</h2>
              <p>Você não tem permissão para acessar esta página.</p>
            </div>
          )}
        </ProtectedRoute>
      } />

      {/* Rota para atualizar ativo */}
      <Route path="/atualizar-ativo" element={
        <ProtectedRoute>
          {userRole === 'Admin' || userRole === 'Research' ? (
            <AtualizarAtivo />
          ) : (
            <div className="access-denied">
              <h2>Acesso Negado</h2>
              <p>Você não tem permissão para acessar esta página.</p>
            </div>
          )}
        </ProtectedRoute>
      } />

      {/* Rota para consultar ativos */}
      <Route path="/consultar-ativos" element={<PrivateRoute><ConsultarAtivos /></PrivateRoute>} />

      {/* Rota para páginas não encontradas (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;