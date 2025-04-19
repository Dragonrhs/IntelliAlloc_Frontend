import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ViewAssetClassEvaluation from '../components/ViewAssetClassEvaluation';
import { useTheme } from '../context/ThemeContext';
import './ViewAssetClassPage.css';

const ViewAssetClassPage: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme } = useTheme();

  return (
    <div className={`view-asset-class-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
      />
      
      <div className="content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Visualização de Avaliações de Classes de Ativos</h2>
        
        <div className="month-selector">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className={isDarkMode ? 'dark-mode' : ''}
          />
        </div>

        {mesSelecionado && (
          <ViewAssetClassEvaluation mesSelecionado={mesSelecionado} />
        )}
      </div>
    </div>
  );
};

export default ViewAssetClassPage; 