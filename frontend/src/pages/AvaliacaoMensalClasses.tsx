import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChartBar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AvaliacaoMensalClassesComponent from '../components/AvaliacaoMensalClassesComponent';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './AvaliacaoMensalClasses.css';

const AvaliacaoMensalClasses: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  const handleAvaliacaoSalva = () => {
    setToastMessage('Avaliação mensal salva com sucesso!');
    setToastType('success');
    setShowToast(true);
  };

  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMesSelecionado(e.target.value);
    if (e.target.value) {
      setToastMessage('Mês selecionado: ' + e.target.value);
      setToastType('info');
      setShowToast(true);
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`avaliacao-mensal-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando avaliação mensal...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`avaliacao-mensal-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
        showBackButton={true}
      />
      
      <div className="avaliacao-mensal-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="evaluation-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faChartBar} className="header-icon" />
              <h1>Avaliação Mensal de Classes de Ativos</h1>
            </div>
            <p>Avalie as classes de ativos por parâmetros mensais para otimizar as carteiras</p>
          </div>
        </div>

        {/* Seletor de Mês */}
        <CustomCard className="month-selector-card" isDarkMode={isDarkMode}>
          <div className="selector-header">
            <FontAwesomeIcon icon={faCalendarAlt} className="selector-icon" />
            <h3>Selecionar Mês de Referência</h3>
          </div>
          <div className="selector-content">
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Mês de Avaliação</span>
              </label>
              <input
                type="month"
                value={mesSelecionado}
                onChange={handleMesChange}
                className="month-input"
                placeholder="Selecione um mês"
              />
            </div>
            {mesSelecionado && (
              <div className="selected-month">
                <FontAwesomeIcon icon={faCalendarAlt} className="check-icon" />
                <span>Avaliando mês: {mesSelecionado}</span>
              </div>
            )}
          </div>
        </CustomCard>

        {/* Componente de Avaliação */}
        {mesSelecionado && (
          <AvaliacaoMensalClassesComponent
            mesSelecionado={mesSelecionado}
            onAvaliacaoSalva={handleAvaliacaoSalva}
          />
        )}

        {/* Estado Vazio */}
        {!mesSelecionado && (
          <CustomCard className="empty-state" isDarkMode={isDarkMode}>
            <div className="empty-content">
              <FontAwesomeIcon icon={faChartBar} className="empty-icon" />
              <h3>Nenhum Mês Selecionado</h3>
              <p>Selecione um mês para começar a avaliação mensal das classes de ativos</p>
              <div className="info-tips">
                <div className="tip">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>A avaliação mensal considera múltiplos parâmetros</span>
                </div>
                <div className="tip">
                  <FontAwesomeIcon icon={faChartBar} />
                  <span>Use notas de 0 a 10 para cada parâmetro</span>
                </div>
              </div>
            </div>
          </CustomCard>
        )}
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AvaliacaoMensalClasses; 