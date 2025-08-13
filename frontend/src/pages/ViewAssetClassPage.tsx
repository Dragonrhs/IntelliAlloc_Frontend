import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChartBar } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ViewAssetClassEvaluation from '../components/ViewAssetClassEvaluation';
import CustomCard from '../components/CustomCard';
import { useTheme } from '../context/ThemeContext';
import './ViewAssetClassPage.css';

const ViewAssetClassPage: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  return (
    <div 
      className={`view-asset-class-page ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
      />
      
      <div className="content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="evaluation-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faChartBar} className="header-icon" />
              <h1>Visualização de Avaliações de Classes de Ativos</h1>
            </div>
            <p>Visualize e compare as avaliações de classes de ativos entre diferentes meses</p>
          </div>
        </div>

        <CustomCard className="month-selector-card" isDarkMode={isDarkMode}>
          <div className="selector-header">
            <FontAwesomeIcon icon={faCalendarAlt} className="selector-icon" />
            <h3>Selecionar Mês de Referência</h3>
          </div>
          <div className="selector-content">
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Mês de Visualização</span>
              </label>
              <input
                type="month"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className="month-input"
                placeholder="Selecione um mês"
              />
            </div>
            {mesSelecionado && (
              <div className="selected-month">
                <FontAwesomeIcon icon={faCalendarAlt} className="check-icon" />
                <span>Visualizando mês: {mesSelecionado}</span>
              </div>
            )}
          </div>
        </CustomCard>

        {mesSelecionado && (
          <ViewAssetClassEvaluation mesSelecionado={mesSelecionado} />
        )}
      </div>
    </div>
  );
};

export default ViewAssetClassPage; 