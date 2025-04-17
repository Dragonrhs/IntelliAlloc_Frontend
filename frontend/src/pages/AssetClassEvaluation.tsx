import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AssetClassEvaluationComponent from '../components/AssetClassEvaluation';
import { useTheme } from '../context/ThemeContext';
import './AssetClassEvaluation.css';

const AssetClassEvaluation: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme } = useTheme();

  const handleAvaliacaoSalva = () => {
    // Atualizar a interface após salvar a avaliação
    // Por exemplo, recarregar os dados ou mostrar uma mensagem de sucesso
  };

  return (
    <div className={`asset-class-evaluation-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
      />
      
      <div className="asset-class-evaluation-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Avaliação de Classes de Ativos</h2>
        
        <div className="month-selector">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className={isDarkMode ? 'dark-mode' : ''}
          />
        </div>

        <AssetClassEvaluationComponent
          mesSelecionado={mesSelecionado}
          onAvaliacaoSalva={handleAvaliacaoSalva}
        />
      </div>
    </div>
  );
};

export default AssetClassEvaluation; 