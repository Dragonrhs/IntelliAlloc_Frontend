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

  const handleViewClients = () => navigate('/clients');
  const handleViewHistory = () => navigate('/history');
  const handleViewSystemHistory = () => navigate('/system-history');
  const handleViewManagement = () => navigate('/management'); // Novo handler
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
        {/* Adicionar Cliente - Disponível para todos exceto Research */}
        {onAddClient && (
          <div className="sidebar-item" onClick={onAddClient}>
            <span className="sidebar-button">➕</span>
            {isExpanded && <span className="sidebar-text">Adicionar Cliente</span>}
          </div>
        )}
        {/* Ver Clientes - Disponível para todos */}
        <div className="sidebar-item" onClick={handleViewClients}>
          <span className="sidebar-button">👥</span>
          {isExpanded && <span className="sidebar-text">Ver Clientes</span>}
        </div>
        {/* Histórico Pessoal - Disponível para todos */}
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