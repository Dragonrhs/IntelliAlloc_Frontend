import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomCard from '../components/CustomCard';
import { useTheme } from '../context/ThemeContext';
import './ViewRecommendedPortfolio.css';
import '../components/LoadingSpinner.css';

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
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const [userRole, setUserRole] = useState<string>('');
  const [comparacaoResultado, setComparacaoResultado] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeses();
  }, []);

  const fetchMeses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/carteira/meses', {
        withCredentials: true
      });
      setMeses(response.data.meses);
    } catch (error: any) {
      setErrorMessage('Erro ao carregar meses disponíveis');
      console.error('Erro:', error);
    }
  };

  const handleMesChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mes = event.target.value;
    setMesSelecionado(mes);
    setCarteiras([]);
    setErrorMessage('');

    if (mes) {
      try {
        const response = await axios.get(`http://localhost:5000/api/carteira/${mes}`, {
          withCredentials: true
        });
        setCarteiras(response.data.carteiras);
      } catch (error: any) {
        setErrorMessage('Erro ao carregar carteiras do mês selecionado');
        console.error('Erro:', error);
      }
    }
  };

  const handleComparar = async () => {
    if (!mesSelecionado || !mesComparacao) {
      setErrorMessage('Selecione dois meses para comparar');
      return;
    }

    setIsLoading(true);
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
    } catch (error: any) {
      setErrorMessage('Erro ao comparar carteiras');
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCarteiraTable = (perfil: string) => {
    const carteirasPerfil = carteiras.filter(c => c.perfil === perfil);
    
    return (
      <div className="carteira-table-container">
        <h3>{perfil}</h3>
        <table className={`carteira-table ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
                <td>{carteira.classe_ativo}</td>
                <td>{carteira.banda_inferior}%</td>
                <td>{carteira.banda_neutra}%</td>
                <td>{carteira.banda_superior}%</td>
              </tr>
            ))}
          </tbody>
        </table>
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

  return (
    <div className={`view-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className={`view-portfolio-content ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h2>Visualizar Carteiras Recomendadas</h2>
        <div className="controls">
          <div className="select-group">
            <select
              value={mesSelecionado}
              onChange={handleMesChange}
              className={isDarkMode ? 'dark-mode' : 'light-mode'}
            >
              <option value="">Selecione um mês</option>
              {meses.map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
            <select
              value={mesComparacao}
              onChange={(e) => setMesComparacao(e.target.value)}
              className={isDarkMode ? 'dark-mode' : 'light-mode'}
            >
              <option value="">Selecione um mês para comparar</option>
              {meses.filter(mes => mes !== mesSelecionado).map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
            <div className="compare-button-container">
              <button
                onClick={handleComparar}
                disabled={!mesSelecionado || !mesComparacao || isLoading}
                className={`compare-button ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
              >
                Comparar Carteiras
                {isLoading && <div className={`loading-spinner ${isDarkMode ? 'dark-mode' : 'light-mode'}`} />}
              </button>
            </div>
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {comparacaoResultado && (
          <CustomCard className="comparison-result" isDarkMode={isDarkMode}>
            <h3>Resultado da Comparação</h3>
            <div className="comparison-text">
              {formatComparisonText(comparacaoResultado).split('\n').map((line, index) => {
                if (line.includes('Principais Mudanças:') || 
                    line.includes('Perfil') || 
                    line.includes('Tendência Geral:')) {
                  return <h4 key={index} className="comparison-subtitle">{line}</h4>;
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
        {mesSelecionado && carteiras.length > 0 && (
          <CustomCard className="carteira-view" isDarkMode={isDarkMode}>
            {['Conservador', 'Moderado', 'Sofisticado'].map(perfil => (
              <div key={perfil} className="perfil-section">
                {renderCarteiraTable(perfil)}
              </div>
            ))}
          </CustomCard>
        )}
      </div>
    </div>
  );
}

export default ViewRecommendedPortfolio; 