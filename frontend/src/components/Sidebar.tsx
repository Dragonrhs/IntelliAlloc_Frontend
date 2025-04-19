import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useUser } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faUserPlus, 
  faHistory, 
  faCog, 
  faScroll, 
  faChartBar, 
  faBriefcase, 
  faPlus, 
  faEdit, 
  faSync, 
  faSearch,
  faSun,
  faMoon,
  faChevronLeft,
  faChevronRight,
  faClockRotateLeft,
  faBalanceScale,
  faChartLine,
  faSliders,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

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

  const canManagePortfolio = userRole === 'Admin' || userRole === 'Alocacao';
  const canManageAssets = userRole === 'Admin' || userRole === 'Research';

  // Se o usuário for PS, mostra apenas as funcionalidades permitidas
  if (userRole === 'PS') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/clients')} title={!isExpanded ? 'Clientes' : ''}>
                {isExpanded ? 'Clientes' : <FontAwesomeIcon icon={faUsers} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/suitability')} title={!isExpanded ? 'Novo Cliente' : ''}>
                {isExpanded ? 'Novo Cliente' : <FontAwesomeIcon icon={faUserPlus} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/history')} title={!isExpanded ? 'Histórico' : ''}>
                {isExpanded ? 'Histórico' : <FontAwesomeIcon icon={faHistory} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-recommended-portfolio')} title={!isExpanded ? 'Carteiras Recomendadas' : ''}>
                {isExpanded ? 'Carteiras Recomendadas' : <FontAwesomeIcon icon={faBriefcase} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/consultar-ativos')} title={!isExpanded ? 'Consultar Ativos' : ''}>
                {isExpanded ? 'Consultar Ativos' : <FontAwesomeIcon icon={faSearch} />}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário for Admin, mostra todas as funcionalidades
  if (userRole === 'Admin') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/clients')} title={!isExpanded ? 'Clientes' : ''}>
                {isExpanded ? 'Clientes' : <FontAwesomeIcon icon={faUsers} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/suitability')} title={!isExpanded ? 'Novo Cliente' : ''}>
                {isExpanded ? 'Novo Cliente' : <FontAwesomeIcon icon={faUserPlus} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/history')} title={!isExpanded ? 'Histórico' : ''}>
                {isExpanded ? 'Histórico' : <FontAwesomeIcon icon={faHistory} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/management')} title={!isExpanded ? 'Gerenciamento' : ''}>
                {isExpanded ? 'Gerenciamento' : <FontAwesomeIcon icon={faCog} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/system-history')} title={!isExpanded ? 'Histórico do Sistema' : ''}>
                {isExpanded ? 'Histórico do Sistema' : <FontAwesomeIcon icon={faScroll} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/estatisticas')} title={!isExpanded ? 'Estatísticas' : ''}>
                {isExpanded ? 'Estatísticas' : <FontAwesomeIcon icon={faChartBar} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-recommended-portfolio')} title={!isExpanded ? 'Carteiras Recomendadas' : ''}>
                {isExpanded ? 'Carteiras Recomendadas' : <FontAwesomeIcon icon={faBriefcase} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/recommended-portfolio')} title={!isExpanded ? 'Adicionar Carteira' : ''}>
                {isExpanded ? 'Adicionar Carteira' : <FontAwesomeIcon icon={faPlus} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/asset-class-evaluation')} title={!isExpanded ? 'Avaliação de Classes' : ''}>
                {isExpanded ? 'Avaliação de Classes' : <FontAwesomeIcon icon={faBalanceScale} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-asset-class')} title={!isExpanded ? 'Visualizar Avaliações' : ''}>
                {isExpanded ? 'Visualizar Avaliações' : <FontAwesomeIcon icon={faChartLine} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/avaliacao-mensal-classes')} title={!isExpanded ? 'Avaliação Mensal de Classes' : ''}>
                {isExpanded ? 'Avaliação Mensal de Classes' : <FontAwesomeIcon icon={faCalendarCheck} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/parametros-rebalanceamento')} title={!isExpanded ? 'Parâmetros de Rebalanceamento' : ''}>
                {isExpanded ? 'Parâmetros de Rebalanceamento' : <FontAwesomeIcon icon={faSliders} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/escolha-inserir-ativo')} title={!isExpanded ? 'Inserir Ativo' : ''}>
                {isExpanded ? 'Inserir Ativo' : <FontAwesomeIcon icon={faEdit} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/atualizar-ativo')} title={!isExpanded ? 'Atualizar Ativo' : ''}>
                {isExpanded ? 'Atualizar Ativo' : <FontAwesomeIcon icon={faSync} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/consultar-ativos')} title={!isExpanded ? 'Consultar Ativos' : ''}>
                {isExpanded ? 'Consultar Ativos' : <FontAwesomeIcon icon={faSearch} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/historico-ativo')} title={!isExpanded ? 'Histórico de Ativos' : ''}>
                {isExpanded ? 'Histórico de Ativos' : <FontAwesomeIcon icon={faClockRotateLeft} />}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário for Alocacao, mostra apenas as funcionalidades permitidas
  if (userRole === 'Alocacao') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/recommended-portfolio')} title={!isExpanded ? 'Adicionar Carteira' : ''}>
                {isExpanded ? 'Adicionar Carteira' : <FontAwesomeIcon icon={faPlus} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/estatisticas')} title={!isExpanded ? 'Estatísticas' : ''}>
                {isExpanded ? 'Estatísticas' : <FontAwesomeIcon icon={faChartBar} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-recommended-portfolio')} title={!isExpanded ? 'Carteiras Recomendadas' : ''}>
                {isExpanded ? 'Carteiras Recomendadas' : <FontAwesomeIcon icon={faBriefcase} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/asset-class-evaluation')} title={!isExpanded ? 'Avaliação de Classes' : ''}>
                {isExpanded ? 'Avaliação de Classes' : <FontAwesomeIcon icon={faBalanceScale} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/view-asset-class')} title={!isExpanded ? 'Visualizar Avaliações' : ''}>
                {isExpanded ? 'Visualizar Avaliações' : <FontAwesomeIcon icon={faChartLine} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/avaliacao-mensal-classes')} title={!isExpanded ? 'Avaliação Mensal de Classes' : ''}>
                {isExpanded ? 'Avaliação Mensal de Classes' : <FontAwesomeIcon icon={faCalendarCheck} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/parametros-rebalanceamento')} title={!isExpanded ? 'Parâmetros de Rebalanceamento' : ''}>
                {isExpanded ? 'Parâmetros de Rebalanceamento' : <FontAwesomeIcon icon={faSliders} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/consultar-ativos')} title={!isExpanded ? 'Consultar Ativos' : ''}>
                {isExpanded ? 'Consultar Ativos' : <FontAwesomeIcon icon={faSearch} />}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário for Membro, mostra apenas o botão de home
  if (userRole === 'Membro') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário for Research, mostra apenas as funcionalidades permitidas
  if (userRole === 'Research') {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/inserir-ativo')} title={!isExpanded ? 'Inserir Ativo' : ''}>
                {isExpanded ? 'Inserir Ativo' : <FontAwesomeIcon icon={faEdit} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/atualizar-ativo')} title={!isExpanded ? 'Atualizar Ativo' : ''}>
                {isExpanded ? 'Atualizar Ativo' : <FontAwesomeIcon icon={faSync} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/consultar-ativos')} title={!isExpanded ? 'Consultar Ativos' : ''}>
                {isExpanded ? 'Consultar Ativos' : <FontAwesomeIcon icon={faSearch} />}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation('/historico-ativo')} title={!isExpanded ? 'Histórico de Ativos' : ''}>
                {isExpanded ? 'Histórico de Ativos' : <FontAwesomeIcon icon={faClockRotateLeft} />}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Para outros usuários, mostra apenas o botão de home
  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
              {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
          {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;