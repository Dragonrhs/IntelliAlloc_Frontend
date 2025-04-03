import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

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
  showBackButton = false
}) => {
  const navigate = useNavigate();
  const { userRole } = useUser();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Se o usuário for membro, mostra apenas o botão de home
  if (userRole === 'Membro') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            {isExpanded ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : '🏠'}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro ☀️' : 'Modo Escuro 🌙') : (isDarkMode ? '☀️' : '🌙')}
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário for PS, mostra apenas as funcionalidades permitidas
  if (userRole === 'PS') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            {isExpanded ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : '🏠'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/clients')} title={!isExpanded ? 'Clientes' : ''}>
                {isExpanded ? 'Clientes' : '👥'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/suitability')} title={!isExpanded ? 'Novo Cliente' : ''}>
                {isExpanded ? 'Novo Cliente' : '➕'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/history')} title={!isExpanded ? 'Histórico' : ''}>
                {isExpanded ? 'Histórico' : '📋'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-recommended-portfolio')} title={!isExpanded ? 'Carteiras Recomendadas' : ''}>
                {isExpanded ? 'Carteiras Recomendadas' : '💼'}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro ☀️' : 'Modo Escuro 🌙') : (isDarkMode ? '☀️' : '🌙')}
          </button>
        </div>
      </div>
    );
  }

  // Para Admin, mostra todas as funcionalidades
  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
              {isExpanded ? 'Home' : '🏠'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/clients')} title={!isExpanded ? 'Clientes' : ''}>
              {isExpanded ? 'Clientes' : '👥'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/suitability')} title={!isExpanded ? 'Novo Cliente' : ''}>
              {isExpanded ? 'Novo Cliente' : '➕'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/history')} title={!isExpanded ? 'Histórico' : ''}>
              {isExpanded ? 'Histórico' : '📋'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/management')} title={!isExpanded ? 'Gerenciamento' : ''}>
              {isExpanded ? 'Gerenciamento' : '⚙️'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/system-history')} title={!isExpanded ? 'Histórico do Sistema' : ''}>
              {isExpanded ? 'Histórico do Sistema' : '📜'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/estatisticas')} title={!isExpanded ? 'Estatísticas' : ''}>
              {isExpanded ? 'Estatísticas' : '📊'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/view-recommended-portfolio')} title={!isExpanded ? 'Carteiras Recomendadas' : ''}>
              {isExpanded ? 'Carteiras Recomendadas' : '💼'}
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/recommended-portfolio')} title={!isExpanded ? 'Adicionar Carteira' : ''}>
              {isExpanded ? 'Adicionar Carteira' : '📝'}
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
          {isExpanded ? (isDarkMode ? 'Modo Claro ☀️' : 'Modo Escuro 🌙') : (isDarkMode ? '☀️' : '🌙')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;