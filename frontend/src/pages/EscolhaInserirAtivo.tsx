import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faUpload, 
  faExclamationCircle,
  faUserPlus,
  faFileUpload
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './EscolhaInserirAtivo.css';

const EscolhaInserirAtivo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled } = useTheme();
  const { checkPermission } = useUser();

  // Verificar permissão usando o sistema centralizado
  const temPermissao = checkPermission('/escolha-inserir-ativo', 'GET');
  console.log('[EscolhaInserirAtivo] Resultado da verificação de permissão:', temPermissao);

  if (!temPermissao) {
    console.log('[EscolhaInserirAtivo] Acesso negado - temPermissao é:', temPermissao);
    return (
      <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <Navbar isDarkMode={isDarkMode} showAvatar={false} />
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={false}
        />
        <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
          <div className="escolha-container">
            <h2>
              <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: '15px', color: '#ff4757' }} />
              Acesso Negado
            </h2>
            <p>Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('[EscolhaInserirAtivo] Acesso permitido - temPermissao é:', temPermissao);
  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="escolha-container">
          <h2>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '15px', color: '#4facfe' }} />
            Escolha o método de inserção
          </h2>
          <div className="botoes-container">
            <button 
              className="botao-escolha"
              onClick={() => navigate('/inserir-ativo')}
            >
              <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '10px' }} />
              Inserir Ativo Individual
            </button>
            <button 
              className="botao-escolha"
              onClick={() => navigate('/importar-ativos-lote')}
            >
              <FontAwesomeIcon icon={faFileUpload} style={{ marginRight: '10px' }} />
              Importar em Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscolhaInserirAtivo; 