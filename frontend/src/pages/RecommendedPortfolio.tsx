import React, { useState, useEffect, ReactElement } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faEdit,
  faPlus,
  faSave,
  faTimes,
  faRobot,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faCog,
  faArrowLeft,
  faBrain,
  faPercentage,
  faCalendarAlt,
  faShieldAlt,
  faBalanceScale
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomCard from '../components/CustomCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './RecommendedPortfolio.css';
import IAExplanation from '../components/IAExplanation';

interface Carteira {
  perfil: string;
  classe_ativo: string;
  banda_inferior: number | undefined;
  banda_neutra: number | undefined;
  banda_superior: number | undefined;
}

const CLASSES_ATIVO = [
  'Pós-Fixado',
  'Inflação',
  'Pré-Fixado',
  'Multimercado',
  'Renda Variável Brasil',
  'Fundos Listados',
  'Alternativos',
  'Renda Fixa Global',
  'Renda Variável Internacional'
];

const PERFIS = ['Conservador', 'Moderado', 'Sofisticado'];

const RecommendedPortfolio: React.FC = () => {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | ReactElement>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [meses, setMeses] = useState<string[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isIAEnabled, setIsIAEnabled] = useState(false);
  const [isIALoading, setIsIALoading] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isBackgroundAnimationEnabled } = useTheme();

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

  const fetchAvaliacoes = async (mes: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/asset-class-evaluation/${mes}`, {
        withCredentials: true
      });
      setAvaliacoes(response.data.avaliacoes);
    } catch (error: any) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const handleMesChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mes = event.target.value;
    setMesSelecionado(mes);
    setIsEditing(false);
    setIsAdding(false);
    setCarteiras([]);
    setErrorMessage('');
    setSuccessMessage('');

    if (mes) {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/carteira/${mes}`, {
          withCredentials: true
        });
        setCarteiras(response.data.carteiras);
        await fetchAvaliacoes(mes);
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

  const handleEditClick = () => {
    if (!mesSelecionado) {
      setToastMessage('Selecione um mês para editar');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setIsEditing(false);
    setCarteiras([]);
    setMesSelecionado('');
    setAvaliacoes([]);
  };

  const canEnableIA = (): boolean => {
    if (!mesSelecionado) return false;
    
    // Verifica se todas as bandas inferiores e superiores estão preenchidas
    for (const perfil of PERFIS) {
      for (const classe of CLASSES_ATIVO) {
        const carteira = carteiras.find(c => c.perfil === perfil && c.classe_ativo === classe);
        if (!carteira || carteira.banda_inferior === undefined || carteira.banda_superior === undefined) {
          return false;
        }
      }
    }
    return true;
  };

  const validateSomaPercentuais = (carteiras: Carteira[], perfil: string): boolean => {
    const carteirasPerfil = carteiras.filter(c => c.perfil === perfil);
    const soma = carteirasPerfil.reduce((acc, curr) => acc + (curr.banda_neutra || 0), 0);
    return Math.abs(soma - 100) < 0.01;
  };

  const handleIAChange = async () => {
    if (isIAEnabled) {
      setIsIAEnabled(false);
      setErrorMessage('');
      setToastMessage('IA desativada com sucesso!');
      setToastType('success');
      setShowToast(true);
      return;
    }

    if (!canEnableIA()) {
      setToastMessage('Preencha todas as bandas inferiores e superiores para ativar a IA');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsIALoading(true);
    setErrorMessage('');

    try {
      // Processar cada perfil separadamente
      for (const perfil of PERFIS) {
        const carteirasPerfil = carteiras.filter(c => c.perfil === perfil);
        
        // Enviar dados para a IA
        const response = await axios.post('http://localhost:5000/api/ia/sugerir-banda-neutra', {
          carteiras: carteirasPerfil,
          mes_atual: mesSelecionado,
          perfil: perfil,
          avaliacoes: avaliacoes
        }, {
          withCredentials: true
        });

        // Atualizar as bandas neutras com as sugestões da IA
        const novasCarteiras = [...carteiras];
        response.data.sugestoes.forEach((sugestao: any) => {
          const index = novasCarteiras.findIndex(
            c => c.perfil === sugestao.perfil && c.classe_ativo === sugestao.classe_ativo
          );
          if (index >= 0) {
            novasCarteiras[index].banda_neutra = sugestao.banda_neutra;
          }
        });

        setCarteiras(novasCarteiras);
        setSuccessMessage('');
        if (response.data.explicacao) {
          setSuccessMessage(
            <IAExplanation 
              text={response.data.explicacao} 
              isDarkMode={isDarkMode} 
            />
          );
        } else {
          setToastMessage('IA ativada com sucesso! As bandas neutras foram calculadas automaticamente.');
          setToastType('success');
          setShowToast(true);
        }
      }

      setIsIAEnabled(true);
      setErrorMessage('');
    } catch (error: any) {
      setToastMessage('Erro ao consultar a IA: ' + (error.response?.data?.error || 'Erro desconhecido'));
      setToastType('error');
      setShowToast(true);
      console.error('Erro:', error);
    } finally {
      setIsIALoading(false);
    }
  };

  const handleCarteiraChange = (
    perfil: string,
    classe: string,
    field: 'banda_inferior' | 'banda_neutra' | 'banda_superior',
    value: string
  ) => {
    const newCarteiras = [...carteiras];
    const index = newCarteiras.findIndex(c => c.perfil === perfil && c.classe_ativo === classe);
    
    if (index >= 0) {
      // Atualiza carteira existente
      newCarteiras[index] = {
        ...newCarteiras[index],
        [field]: value === '' ? undefined : Number(value)
      };
    } else {
      // Cria nova carteira
      newCarteiras.push({
        perfil,
        classe_ativo: classe,
        banda_inferior: field === 'banda_inferior' ? (value === '' ? undefined : Number(value)) : undefined,
        banda_neutra: field === 'banda_neutra' ? (value === '' ? undefined : Number(value)) : undefined,
        banda_superior: field === 'banda_superior' ? (value === '' ? undefined : Number(value)) : undefined
      });
    }
    
    setCarteiras(newCarteiras);
    
    // Se a IA estiver ativada e mudar bandas inferior ou superior, recalcula a banda neutra
    if (isIAEnabled && (field === 'banda_inferior' || field === 'banda_superior')) {
      handleIAChange();
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Validar soma dos percentuais para cada perfil
    for (const perfil of PERFIS) {
      if (!validateSomaPercentuais(carteiras, perfil)) {
        setToastMessage(`A soma dos percentuais da banda neutra para o perfil ${perfil} deve ser 100%`);
        setToastType('error');
        setShowToast(true);
        return;
      }
    }

    try {
      setIsLoading(true);
      if (isAdding) {
        await axios.post('http://localhost:5000/api/carteira/adicionar', {
          mes_referencia: mesSelecionado,
          carteiras: carteiras
        }, {
          withCredentials: true
        });
        setToastMessage('Carteira adicionada com sucesso!');
        setToastType('success');
        setShowToast(true);
      } else if (isEditing) {
        await axios.put(`http://localhost:5000/api/carteira/editar/${mesSelecionado}`, {
          carteiras: carteiras
        }, {
          withCredentials: true
        });
        setToastMessage('Carteira atualizada com sucesso!');
        setToastType('success');
        setShowToast(true);
      }

      setIsEditing(false);
      setIsAdding(false);
      fetchMeses();
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Erro ao salvar carteira');
      setToastType('error');
      setShowToast(true);
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCarteiras([]);
    setMesSelecionado('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
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

  if (isLoading) {
    return (
      <div className={`recommended-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando carteiras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`recommended-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="recommended-portfolio-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="portfolio-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faChartPie} className="header-icon" />
              <h1>Gerenciar Carteiras Recomendadas</h1>
            </div>
            <p>Configure e otimize as carteiras de investimento recomendadas por perfil de risco</p>
          </div>
        </div>

        {/* Controles */}
        <div className="controls-section">
          <div className="controls-grid">
            <div className="control-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Selecionar Mês</span>
              </label>
              <select
                value={mesSelecionado}
                onChange={handleMesChange}
                disabled={isAdding}
                className={`month-selector ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
              >
                <option value="">Selecione um mês</option>
                {meses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div className="action-buttons">
              <CustomButton
                onClick={handleEditClick}
                disabled={!mesSelecionado || isAdding}
                isDarkMode={isDarkMode}
                className="edit-button"
              >
                <FontAwesomeIcon icon={faEdit} />
                <span>Editar Carteira</span>
              </CustomButton>

              <CustomButton
                onClick={handleAddClick}
                disabled={isEditing}
                isDarkMode={isDarkMode}
                className="add-button"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Nova Carteira</span>
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Formulário de Carteira */}
        {(isEditing || isAdding) && (
          <CustomCard className="carteira-form" isDarkMode={isDarkMode}>
            {/* Controles de IA */}
            {isAdding && (
              <div className="ia-controls">
                <div className="ia-header">
                  <FontAwesomeIcon icon={faRobot} className="ia-icon" />
                  <h3>Inteligência Artificial</h3>
                </div>
                <div className="ia-content">
                  <div className="month-input">
                    <label>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Mês de Referência</span>
                    </label>
                    <CustomInput
                      type="text"
                      placeholder="YYYY-MM"
                      value={mesSelecionado}
                      onChange={(e) => setMesSelecionado(e.target.value)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <CustomButton
                    onClick={handleIAChange}
                    disabled={!canEnableIA() || isIALoading}
                    isDarkMode={isDarkMode}
                    className={`ia-button ${isIAEnabled ? 'enabled' : 'disabled'}`}
                  >
                    {isIALoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="spinner" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={isIAEnabled ? faTimes : faBrain} />
                        <span>{isIAEnabled ? 'Desativar IA' : 'Ativar IA'}</span>
                      </>
                    )}
                  </CustomButton>
                </div>
                {!canEnableIA() && (
                  <div className="ia-info">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Preencha todas as bandas inferiores e superiores para ativar a IA</span>
                  </div>
                )}
              </div>
            )}

            {/* Seções de Perfil */}
            {PERFIS.map((perfil) => (
              <div key={perfil} className="portfolio-section">
                <div className="section-header" style={{ borderLeftColor: getPerfilColor(perfil) }}>
                  <FontAwesomeIcon icon={getPerfilIcon(perfil)} style={{ color: getPerfilColor(perfil) }} />
                  <h3>{perfil}</h3>
                  <div className="perfil-badge" style={{ backgroundColor: getPerfilColor(perfil) }}>
                    <FontAwesomeIcon icon={faPercentage} />
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="portfolio-grid">
                  <div className="grid-header">
                    <span className="classe-label">Classe de Ativo</span>
                    <div className="bandas-header">
                      <span>Banda Inferior (%)</span>
                      <span>Banda Neutra (%)</span>
                      <span>Banda Superior (%)</span>
                    </div>
                  </div>
                  
                  {CLASSES_ATIVO.map((classe) => {
                    const carteira = carteiras.find(
                      (c) => c.perfil === perfil && c.classe_ativo === classe
                    ) || {
                      perfil,
                      classe_ativo: classe,
                      banda_inferior: undefined,
                      banda_neutra: undefined,
                      banda_superior: undefined
                    };

                    return (
                      <div key={`${perfil}-${classe}`} className="portfolio-row">
                        <span className="classe-ativo">{classe}</span>
                        <div className="bandas">
                          <CustomInput
                            type="number"
                            placeholder="0"
                            value={carteira.banda_inferior === undefined ? '' : carteira.banda_inferior}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_inferior',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                            className="banda-input"
                          />
                          <CustomInput
                            type="number"
                            placeholder="0"
                            value={carteira.banda_neutra === undefined ? '' : carteira.banda_neutra}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_neutra',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                            className="banda-input neutra"
                          />
                          <CustomInput
                            type="number"
                            placeholder="0"
                            value={carteira.banda_superior === undefined ? '' : carteira.banda_superior}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_superior',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                            className="banda-input"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Mensagens */}
            {errorMessage && (
              <div className="message error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="message success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="button-group">
              <CustomButton
                onClick={handleSave}
                isDarkMode={isDarkMode}
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    <span>Salvar</span>
                  </>
                )}
              </CustomButton>
              <CustomButton
                onClick={handleCancel}
                isDarkMode={isDarkMode}
                className="cancel-button"
              >
                <FontAwesomeIcon icon={faTimes} />
                <span>Cancelar</span>
              </CustomButton>
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

export default RecommendedPortfolio; 