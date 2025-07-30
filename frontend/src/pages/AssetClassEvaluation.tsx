import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faCalendarAlt,
  faSave,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faStar,
  faStarHalf,
  faMinus,
  faPlus,
  faBalanceScale,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AssetClassEvaluationComponent from '../components/AssetClassEvaluation';
import CustomCard from '../components/CustomCard';
import CustomButton from '../components/CustomButton';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './AssetClassEvaluation.css';

const AssetClassEvaluation: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme, isBackgroundAnimationEnabled } = useTheme();

  const handleAvaliacaoSalva = () => {
    setToastMessage('Avaliações salvas com sucesso!');
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
      <div className={`asset-class-evaluation-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`asset-class-evaluation-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
        showBackButton={true}
      />
      
      <div className="asset-class-evaluation-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="evaluation-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faChartBar} className="header-icon" />
              <h1>Avaliação de Classes de Ativos</h1>
            </div>
            <p>Avalie e classifique as classes de ativos por mês para otimizar as carteiras</p>
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
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                <span>Avaliando mês: {mesSelecionado}</span>
              </div>
            )}
          </div>
        </CustomCard>

        {/* Componente de Avaliação */}
        {mesSelecionado && (
          <AssetClassEvaluationComponent
            mesSelecionado={mesSelecionado}
            onAvaliacaoSalva={handleAvaliacaoSalva}
          />
        )}

        {/* Estado Vazio */}
        {!mesSelecionado && (
          <CustomCard className="empty-state" isDarkMode={isDarkMode}>
            <div className="empty-content">
              <FontAwesomeIcon icon={faBalanceScale} className="empty-icon" />
              <h3>Nenhum Mês Selecionado</h3>
              <p>Selecione um mês para começar a avaliação das classes de ativos</p>
              <div className="info-tips">
                <div className="tip">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>As avaliações ajudam a otimizar as carteiras recomendadas</span>
                </div>
                <div className="tip">
                  <FontAwesomeIcon icon={faStar} />
                  <span>Use a escala de -2 a +2 para classificar cada classe</span>
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

export default AssetClassEvaluation; 