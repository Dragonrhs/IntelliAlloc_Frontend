import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onAddClient?: () => void;
  onViewClients?: () => void;
  onViewHistory?: () => void;
  isFullSidebar: boolean;
  showBackButton?: boolean; // Nova prop para exibir o botão "Voltar"
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  toggleSidebar,
  isDarkMode,
  toggleTheme,
  onAddClient,
  onViewClients,
  onViewHistory,
  isFullSidebar,
  showBackButton = false, // Valor padrão é false
}) => {
  const navigate = useNavigate();

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      navigate('/history');
    }
  };

  const handleBack = () => {
    navigate(-1); // Volta para a página anterior no histórico de navegação
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
      {isFullSidebar && (
        <>
          <div className="sidebar-item" onClick={onAddClient}>
            <span className="sidebar-button">➕</span>
            {isExpanded && <span className="sidebar-text">Adicionar Cliente</span>}
          </div>
          <div className="sidebar-item" onClick={onViewClients}>
            <span className="sidebar-button">👥</span>
            {isExpanded && <span className="sidebar-text">Ver Clientes</span>}
          </div>
          <div className="sidebar-item" onClick={handleViewHistory}>
            <span className="sidebar-button">📜</span>
            {isExpanded && <span className="sidebar-text">Histórico</span>}
          </div>
        </>
      )}
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