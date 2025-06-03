import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './EscolhaInserirAtivo.css';

const EscolhaInserirAtivo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { checkPermission } = useUser();

  // Verificar permissão usando o sistema centralizado
  const temPermissao = checkPermission('/escolha-inserir-ativo', 'GET');
  console.log('[EscolhaInserirAtivo] Resultado da verificação de permissão:', temPermissao);

  if (!temPermissao) {
    console.log('[EscolhaInserirAtivo] Acesso negado - temPermissao é:', temPermissao);
    return (
      <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Navbar isDarkMode={isDarkMode} showAvatar={false} />
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={false}
        />
        <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  console.log('[EscolhaInserirAtivo] Acesso permitido - temPermissao é:', temPermissao);
  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
          <h2>Escolha o método de inserção</h2>
          <div className="botoes-container">
            <button 
              className="botao-escolha"
              onClick={() => navigate('/inserir-ativo')}
            >
              Inserir Ativo Individual
            </button>
            <button 
              className="botao-escolha"
              onClick={() => navigate('/importar-ativos-lote')}
            >
              Importar em Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscolhaInserirAtivo; 