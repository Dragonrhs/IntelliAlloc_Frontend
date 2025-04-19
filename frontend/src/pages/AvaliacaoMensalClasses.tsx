import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AvaliacaoMensalClassesComponent from '../components/AvaliacaoMensalClassesComponent';
import { useTheme } from '../context/ThemeContext';
import './AvaliacaoMensalClasses.css';

const AvaliacaoMensalClasses: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme } = useTheme();

  const handleAvaliacaoSalva = () => {
    // Atualizar a interface após salvar a avaliação
  };

  return (
    <div className={`avaliacao-mensal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
      />
      
      <div className="avaliacao-mensal-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Avaliação Mensal de Classes de Ativos</h2>
        
        <div className="month-selector">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className={isDarkMode ? 'dark-mode' : ''}
          />
        </div>

        <AvaliacaoMensalClassesComponent
          mesSelecionado={mesSelecionado}
          onAvaliacaoSalva={handleAvaliacaoSalva}
        />
      </div>
    </div>
  );
};

export default AvaliacaoMensalClasses; 