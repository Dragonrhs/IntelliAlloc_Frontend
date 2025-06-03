import React, { useState, useEffect, ReactElement } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomCard from '../components/CustomCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
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
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

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
        const response = await axios.get(`http://localhost:5000/api/carteira/${mes}`, {
          withCredentials: true
        });
        setCarteiras(response.data.carteiras);
        await fetchAvaliacoes(mes);
      } catch (error: any) {
        setErrorMessage('Erro ao carregar carteiras do mês selecionado');
        console.error('Erro:', error);
      }
    }
  };

  const handleEditClick = () => {
    if (!mesSelecionado) {
      setErrorMessage('Selecione um mês para editar');
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
      setSuccessMessage('IA desativada com sucesso!');
      return;
    }

    if (!canEnableIA()) {
      setErrorMessage('Preencha todas as bandas inferiores e superiores para ativar a IA');
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
          setSuccessMessage('IA ativada com sucesso! As bandas neutras foram calculadas automaticamente.');
        }
      }

      setIsIAEnabled(true);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage('Erro ao consultar a IA: ' + (error.response?.data?.error || 'Erro desconhecido'));
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
        setErrorMessage(`A soma dos percentuais da banda neutra para o perfil ${perfil} deve ser 100%`);
        return;
      }
    }

    try {
      if (isAdding) {
        await axios.post('http://localhost:5000/api/carteira/adicionar', {
          mes_referencia: mesSelecionado,
          carteiras: carteiras
        }, {
          withCredentials: true
        });
        setSuccessMessage('Carteira adicionada com sucesso');
      } else if (isEditing) {
        await axios.put(`http://localhost:5000/api/carteira/editar/${mesSelecionado}`, {
          carteiras: carteiras
        }, {
          withCredentials: true
        });
        setSuccessMessage('Carteira atualizada com sucesso');
      }

      setIsEditing(false);
      setIsAdding(false);
      fetchMeses();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Erro ao salvar carteira');
      console.error('Erro:', error);
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

  return (
    <div className={`recommended-portfolio-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className={`recommended-portfolio-content ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h2>Gerenciar Carteiras Recomendadas</h2>
        
        <div className="controls">
          <select
            value={mesSelecionado}
            onChange={handleMesChange}
            disabled={isAdding}
            className={isDarkMode ? 'dark-mode' : 'light-mode'}
          >
            <option value="">Selecione um mês</option>
            {meses.map(mes => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>

          <CustomButton
            onClick={handleEditClick}
            disabled={!mesSelecionado || isAdding}
            isDarkMode={isDarkMode}
          >
            Editar Carteira
          </CustomButton>

          <CustomButton
            onClick={handleAddClick}
            disabled={isEditing}
            isDarkMode={isDarkMode}
          >
            Adicionar Nova Carteira
          </CustomButton>
        </div>

        {(isEditing || isAdding) && (
          <CustomCard className="carteira-form" isDarkMode={isDarkMode}>
            {isAdding && (
              <div className="ia-controls">
                <CustomInput
                  type="text"
                  placeholder="YYYY-MM"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  isDarkMode={isDarkMode}
                />
                <CustomButton
                  onClick={handleIAChange}
                  disabled={!canEnableIA() || isIALoading}
                  isDarkMode={isDarkMode}
                  className={isIAEnabled ? 'ia-enabled' : 'ia-disabled'}
                >
                  {isIALoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    isIAEnabled ? 'Desativar IA' : 'Ativar IA'
                  )}
                </CustomButton>
              </div>
            )}

            {PERFIS.map((perfil) => (
              <div key={perfil} className="portfolio-section">
                <h3>{perfil}</h3>
                <div className="portfolio-grid">
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
                            placeholder=""
                            value={carteira.banda_inferior === undefined ? '' : carteira.banda_inferior}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_inferior',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                          />
                          <CustomInput
                            type="number"
                            placeholder=""
                            value={carteira.banda_neutra === undefined ? '' : carteira.banda_neutra}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_neutra',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                          />
                          <CustomInput
                            type="number"
                            placeholder=""
                            value={carteira.banda_superior === undefined ? '' : carteira.banda_superior}
                            onChange={(e) => handleCarteiraChange(
                              perfil,
                              classe,
                              'banda_superior',
                              e.target.value
                            )}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="button-group">
              <CustomButton
                onClick={handleSave}
                isDarkMode={isDarkMode}
              >
                Salvar
              </CustomButton>
              <CustomButton
                onClick={handleCancel}
                isDarkMode={isDarkMode}
                className="secondary"
              >
                Cancelar
              </CustomButton>
            </div>
          </CustomCard>
        )}
      </div>
    </div>
  );
};

export default RecommendedPortfolio; 