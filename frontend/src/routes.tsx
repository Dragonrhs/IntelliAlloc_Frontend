import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ImportarAtivosLote from './pages/ImportarAtivosLote';
import EscolhaInserirAtivo from './pages/EscolhaInserirAtivo';
import HistoricoAtivo from './pages/HistoricoAtivo';
import HistoricoAtivosList from './pages/HistoricoAtivosList';
import AssetClassEvaluation from './pages/AssetClassEvaluation';
import ViewAssetClassPage from './pages/ViewAssetClassPage';
import ParametrosRebalanceamento from './pages/ParametrosRebalanceamento';
import AvaliacaoMensalClasses from './pages/AvaliacaoMensalClasses';
import PermissionsManagement from './pages/PermissionsManagement';
import ClassificarAtivos from './pages/ClassificarAtivos';
import Dados from './pages/Dados';
import VisualizacaoDados from './pages/VisualizacaoDados';
import { useUser } from './context/UserContext';
import AccessDenied from './components/AccessDenied';
import PageTransition from './components/PageTransition';
import HistoricoClassificacao from './pages/HistoricoClassificacao';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userRole, isLoading, checkPermission } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Verificar permissão específica para a rota
  const temPermissao = checkPermission(location.pathname, 'GET');

  if (!temPermissao) {
    return <AccessDenied />;
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
    <PageTransition>
    <Routes>
      {/* Rota para a página inicial (redireciona para /login se não autenticado) */}
      <Route path="/" element={
        userRole ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
      } />

      {/* Rota protegida para home */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

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
      <Route path="/recommended-portfolio" element={
        <ProtectedRoute>
          <RecommendedPortfolio />
        </ProtectedRoute>
      } />

      {/* Rota para visualização de recomendação de portfólio */}
      <Route path="/view-recommended-portfolio" element={
        <ProtectedRoute>
          <ViewRecommendedPortfolio />
        </ProtectedRoute>
      } />

      {/* Rota para estatísticas */}
      <Route path="/estatisticas" element={
        <ProtectedRoute>
          <Estatisticas />
        </ProtectedRoute>
      } />

      {/* Rota para inserir ativo */}
      <Route path="/inserir-ativo" element={
        <ProtectedRoute>
          <InserirAtivo />
        </ProtectedRoute>
      } />

      {/* Rota para atualizar ativo */}
      <Route path="/atualizar-ativo" element={
        <ProtectedRoute>
          <AtualizarAtivo />
        </ProtectedRoute>
      } />

      {/* Rota para consultar ativos */}
      <Route path="/consultar-ativos" element={
        <ProtectedRoute>
          <ConsultarAtivos />
        </ProtectedRoute>
      } />

        {/* Rota para classificar ativos */}
        <Route path="/classificar-ativos" element={
          <ProtectedRoute>
            <ClassificarAtivos />
        </ProtectedRoute>
      } />

      {/* Rota para importar ativos em lote */}
      <Route path="/importar-ativos-lote" element={
        <ProtectedRoute>
          <ImportarAtivosLote />
        </ProtectedRoute>
      } />

      {/* Rota para escolha de inserção de ativo */}
      <Route path="/escolha-inserir-ativo" element={
        <ProtectedRoute>
          <EscolhaInserirAtivo />
        </ProtectedRoute>
      } />

      {/* Rotas para histórico de ativos */}
      <Route path="/historico-ativo/:id" element={
        <ProtectedRoute>
          <HistoricoAtivo />
        </ProtectedRoute>
      } />
      <Route path="/historico-ativo" element={
        <ProtectedRoute>
          <HistoricoAtivosList />
        </ProtectedRoute>
      } />

      {/* Rota para avaliação de classes de ativos */}
      <Route path="/asset-class-evaluation" element={
        <ProtectedRoute>
          <AssetClassEvaluation />
        </ProtectedRoute>
      } />

      {/* Rota para visualização de avaliações de classes de ativos */}
      <Route path="/view-asset-class" element={
        <ProtectedRoute>
          <ViewAssetClassPage />
        </ProtectedRoute>
      } />

      {/* Rota para avaliação mensal de classes de ativos */}
      <Route path="/avaliacao-mensal-classes" element={
        <ProtectedRoute>
          <AvaliacaoMensalClasses />
        </ProtectedRoute>
      } />

      {/* Rota para parâmetros de rebalanceamento */}
      <Route path="/parametros-rebalanceamento" element={
        <ProtectedRoute>
          <ParametrosRebalanceamento />
        </ProtectedRoute>
      } />

      {/* Rota para gerenciamento de permissões */}
      <Route path="/permissions" element={
        <ProtectedRoute>
          <PermissionsManagement />
        </ProtectedRoute>
      } />

        {/* Rota para histórico de classificações */}
        <Route path="/historico-classificacao" element={
          <ProtectedRoute>
            <HistoricoClassificacao />
          </ProtectedRoute>
        } />

      {/* Rota para a página de Dados e Integração */}
      <Route path="/dados" element={
        <ProtectedRoute>
          <Dados />
        </ProtectedRoute>
      } />

      {/* Rota para visualização de dados */}
      <Route path="/visualizacao-dados" element={<VisualizacaoDados />} />

      {/* Rota para páginas não encontradas (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </PageTransition>
  );
};

export default AppRoutes;