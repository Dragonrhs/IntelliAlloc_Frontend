import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faCalendarAlt,
  faExchangeAlt,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faEye,
  faArrowRight,
  faPercentage,
  faShieldAlt,
  faBalanceScale,
  faBrain,
  faTable,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './ViewRecommendedPortfolio.css';

interface Carteira {
  perfil: string;
  classe_ativo: string;
  banda_inferior: number;
  banda_neutra: number;
  banda_superior: number;
}

const ViewRecommendedPortfolio: React.FC = () => {
  const [meses, setMeses] = useState<string[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesComparacao, setMesComparacao] = useState<string>('');
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled } = useTheme();
  const [userRole, setUserRole] = useState<string>('');
  const [comparacaoResultado, setComparacaoResultado] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeses();
  }, []);

  const fetchMeses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/carteira/meses', {
        withCredentials: true
      });
      setMeses(response.data.meses);
    } catch (error: any) {
      setToastMessage('Erro ao carregar meses disponíveis');
      setToastType('error');
      setShowToast(true);
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMesChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mes = event.target.value;
    setMesSelecionado(mes);
    setCarteiras([]);
    setErrorMessage('');
    setComparacaoResultado('');

    if (mes) {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/carteira/${mes}`, {
          withCredentials: true
        });
        setCarteiras(response.data.carteiras);
        setToastMessage('Carteira carregada com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        setToastMessage('Erro ao carregar carteiras do mês selecionado');
        setToastType('error');
        setShowToast(true);
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComparar = async () => {
    if (!mesSelecionado || !mesComparacao) {
      setToastMessage('Selecione dois meses para comparar');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoadingComparison(true);
    setErrorMessage('');
    setComparacaoResultado('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/carteira/comparar',
        {
          mes1: mesSelecionado,
          mes2: mesComparacao
        },
        { withCredentials: true }
      );

      setComparacaoResultado(response.data.comparison);
      setToastMessage('Comparação realizada com sucesso!');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage('Erro ao comparar carteiras');
      setToastType('error');
      setShowToast(true);
      console.error('Erro:', error);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'Conservador':
        return '#4CAF50';
      case 'Moderado':
        return '#FF9800';
      case 'Sofisticado':
        return '#9C27B0';
      default:
        return '#667eea';
    }
  };

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'Conservador':
        return faShieldAlt;
      case 'Moderado':
        return faBalanceScale;
      case 'Sofisticado':
        return faBrain;
      default:
        return faChartPie;
    }
  };

  const renderCarteiraTable = (perfil: string) => {
    const carteirasPerfil = carteiras.filter(c => c.perfil === perfil);
    
    return (
      <div className="carteira-table-container">
        <div className="table-header" style={{ borderLeftColor: getPerfilColor(perfil) }}>
          <FontAwesomeIcon icon={getPerfilIcon(perfil)} style={{ color: getPerfilColor(perfil) }} />
          <h3>{perfil}</h3>
          <div className="perfil-badge" style={{ backgroundColor: getPerfilColor(perfil) }}>
            <FontAwesomeIcon icon={faPercentage} />
            <span>100%</span>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="carteira-table">
            <thead>
              <tr>
                <th>Classe de Ativo</th>
                <th>Banda Inferior</th>
                <th>Banda Neutra</th>
                <th>Banda Superior</th>
              </tr>
            </thead>
            <tbody>
              {carteirasPerfil.map((carteira, index) => (
                <tr key={index}>
                  <td className="classe-ativo">{carteira.classe_ativo}</td>
                  <td className="banda-inferior">{carteira.banda_inferior}%</td>
                  <td className="banda-neutra">{carteira.banda_neutra}%</td>
                  <td className="banda-superior">{carteira.banda_superior}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const formatComparisonText = (text: string): string => {
    return text
      .replace(/\*\*/g, '') // Remove **negrito**
      .replace(/\*/g, '')   // Remove *itálico*
      .replace(/##/g, '')   // Remove ## títulos
      .replace(/\n\n/g, '\n') // Remove linhas em branco extras
      .trim();
  };

  if (isLoading) {
    return (
      <div className={`view-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando carteiras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`view-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="view-portfolio-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="portfolio-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faEye} className="header-icon" />
              <h1>Visualizar Carteiras Recomendadas</h1>
            </div>
            <p>Analise e compare carteiras de investimento por perfil de risco</p>
          </div>
        </div>

        {/* Controles */}
        <div className="controls-section">
          <div className="controls-grid">
            <div className="control-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Mês Principal</span>
              </label>
              <select
                value={mesSelecionado}
                onChange={handleMesChange}
                className="month-selector"
              >
                <option value="">Selecione um mês</option>
                {meses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>
                <FontAwesomeIcon icon={faExchangeAlt} />
                <span>Mês para Comparação</span>
              </label>
              <select
                value={mesComparacao}
                onChange={(e) => setMesComparacao(e.target.value)}
                className="month-selector"
              >
                <option value="">Selecione um mês para comparar</option>
                {meses.filter(mes => mes !== mesSelecionado).map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>&nbsp;</label>
              <button
                onClick={handleComparar}
                disabled={!mesSelecionado || !mesComparacao || isLoadingComparison}
                className="compare-button"
              >
                {isLoadingComparison ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                    <span>Comparando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    <span>Comparar Carteiras</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resultado da Comparação */}
        {comparacaoResultado && (
          <CustomCard className="comparison-result" isDarkMode={isDarkMode}>
            <div className="comparison-header">
              <FontAwesomeIcon icon={faInfoCircle} className="comparison-icon" />
              <h3>Resultado da Comparação</h3>
            </div>
            <div className="comparison-text">
              {formatComparisonText(comparacaoResultado).split('\n').map((line, index) => {
                if (line.includes('Principais Mudanças:') || 
                    line.includes('Perfil') || 
                    line.includes('Tendência Geral:')) {
                  return (
                    <div key={index} className="comparison-subtitle">
                      <FontAwesomeIcon icon={faArrowRight} />
                      <h4>{line}</h4>
                    </div>
                  );
                } else if (line.trim().startsWith('*')) {
                  return (
                    <div key={index} className="comparison-list-item">
                      <span className="bullet">•</span>
                      <span>{line.replace('*', '').trim()}</span>
                    </div>
                  );
                }
                return <p key={index} className="comparison-paragraph">{line}</p>;
              })}
            </div>
          </CustomCard>
        )}

        {/* Visualização das Carteiras */}
        {mesSelecionado && carteiras.length > 0 && (
          <CustomCard className="carteira-view" isDarkMode={isDarkMode}>
            <div className="view-header">
              <FontAwesomeIcon icon={faTable} className="view-icon" />
              <h3>Carteiras do Mês: {mesSelecionado}</h3>
            </div>
            {['Conservador', 'Moderado', 'Sofisticado'].map(perfil => (
              <div key={perfil} className="perfil-section">
                {renderCarteiraTable(perfil)}
              </div>
            ))}
          </CustomCard>
        )}

        {/* Estado Vazio */}
        {!mesSelecionado && (
          <CustomCard className="empty-state" isDarkMode={isDarkMode}>
            <div className="empty-content">
              <FontAwesomeIcon icon={faChartPie} className="empty-icon" />
              <h3>Nenhuma Carteira Selecionada</h3>
              <p>Selecione um mês para visualizar as carteiras recomendadas</p>
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

export default ViewRecommendedPortfolio; 