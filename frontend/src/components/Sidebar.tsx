import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onAddClient?: () => void;
  isFullSidebar: boolean;
  showBackButton?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  toggleSidebar,
  isDarkMode,
  toggleTheme,
  onAddClient,
  isFullSidebar,
  showBackButton = false,
}) => {
  const navigate = useNavigate();
  const { role } = useTheme();

  const handleViewHome = () => navigate('/home');
  const handleViewClients = () => navigate('/clients');
  const handleViewHistory = () => navigate('/history');
  const handleViewSystemHistory = () => navigate('/system-history');
  const handleViewManagement = () => navigate('/management');
  const handleViewRecommendedPortfolio = () => navigate('/recommended-portfolio');
  const handleViewViewRecommendedPortfolio = () => navigate('/view-recommended-portfolio');
  const handleBack = () => navigate(-1);

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar-top">
        <div className="sidebar-item" onClick={toggleSidebar}>
          <span className="sidebar-button">{isExpanded ? '←' : '→'}</span>
          {isExpanded && <span className="sidebar-text">Menu</span>}
        </div>
        {showBackButton && (
          <div className="sidebar-item" onClick={handleBack}>
            <span className="sidebar-button">↩</span>
            {isExpanded && <span className="sidebar-text">Voltar</span>}
          </div>
        )}
      </div>

      <div className="sidebar-middle">
        {/* Botão Casa - Disponível para todos */}
        <div className="sidebar-item" onClick={handleViewHome}>
          <span className="sidebar-button">🏠</span>
          {isExpanded && <span className="sidebar-text">Home</span>}
        </div>

        {/* Funcionalidades restritas para não-Membro */}
        {role !== 'Membro' && (
          <>
            {/* Adicionar Cliente - Disponível para todos exceto Research e Membro */}
            {onAddClient && role !== 'Research' && (
              <div className="sidebar-item" onClick={onAddClient}>
                <span className="sidebar-button">➕</span>
                {isExpanded && <span className="sidebar-text">Adicionar Cliente</span>}
              </div>
            )}
            {/* Ver Clientes - Disponível para todos exceto Membro */}
            <div className="sidebar-item" onClick={handleViewClients}>
              <span className="sidebar-button">👥</span>
              {isExpanded && <span className="sidebar-text">Ver Clientes</span>}
            </div>
            {/* Histórico Pessoal - Disponível para todos exceto Membro */}
            <div className="sidebar-item" onClick={handleViewHistory}>
              <span className="sidebar-button">📜</span>
              {isExpanded && <span className="sidebar-text">Histórico</span>}
            </div>
            {/* Histórico do Sistema - Disponível apenas para Admin */}
            {role === 'Admin' && (
              <div className="sidebar-item" onClick={handleViewSystemHistory}>
                <span className="sidebar-button">🖥️</span>
                {isExpanded && <span className="sidebar-text">Histórico do Sistema</span>}
              </div>
            )}
            {/* Gerenciamento - Disponível apenas para Admin */}
            {role === 'Admin' && (
              <div className="sidebar-item" onClick={handleViewManagement}>
                <span className="sidebar-button">⚙️</span>
                {isExpanded && <span className="sidebar-text">Gerenciamento</span>}
              </div>
            )}
            {/* Inserir Carteira Recomendada - Disponível apenas para Admin e Alocacao */}
            {(role === 'Admin' || role === 'Alocacao') && (
              <div className="sidebar-item" onClick={handleViewRecommendedPortfolio}>
                <span className="sidebar-button">📊</span>
                {isExpanded && <span className="sidebar-text">Inserir Carteira Recomendada</span>}
              </div>
            )}
            {/* Visualizar Carteira Recomendada - Disponível para PS, Admin e Alocacao */}
            {(role === 'PS' || role === 'Admin' || role === 'Alocacao') && (
              <div className="sidebar-item" onClick={handleViewViewRecommendedPortfolio}>
                <span className="sidebar-button">👁️</span>
                {isExpanded && <span className="sidebar-text">Visualizar Carteira Recomendada</span>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item" onClick={toggleTheme}>
          <span className="sidebar-button">{isDarkMode ? '☀️' : '🌙'}</span>
          {isExpanded && <span className="sidebar-text">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;