import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faEdit,
  faArrowLeft,
  faClock,
  faBullseye,
  faPiggyBank,
  faGraduationCap,
  faList,
  faComments,
  faSave,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './Suitability.css';

const Suitability: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [q1InvestmentDuration, setQ1InvestmentDuration] = useState('');
  const [q2InvestmentPurpose, setQ2InvestmentPurpose] = useState('');
  const [q3InvestmentAllocation, setQ3InvestmentAllocation] = useState('');
  const [q4FinancialExperience, setQ4FinancialExperience] = useState('');
  const [q5InvestmentOptions, setQ5InvestmentOptions] = useState<string[]>([]);
  const [q6Observations, setQ6Observations] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`http://localhost:5000/client/${clientId}`, {
            withCredentials: true,
          });
          const client = response.data;
          setClientName(client.client_name);
          setQ1InvestmentDuration(client.q1_investment_duration);
          setQ2InvestmentPurpose(client.q2_investment_purpose);
          setQ3InvestmentAllocation(client.q3_investment_allocation);
          setQ4FinancialExperience(client.q4_financial_experience);
          setQ5InvestmentOptions(client.q5_investment_options);
          setQ6Observations(client.q6_observations || '');
        } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          setToastMessage('Erro ao carregar dados do cliente');
          setToastType('error');
          setShowToast(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchClient();
    }
  }, [clientId]);

  const handleQ5Change = (option: string) => {
    if (q5InvestmentOptions.includes(option)) {
      setQ5InvestmentOptions(q5InvestmentOptions.filter((item) => item !== option));
    } else {
      setQ5InvestmentOptions([...q5InvestmentOptions, option]);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (
      !clientName ||
      !q1InvestmentDuration ||
      !q2InvestmentPurpose ||
      !q3InvestmentAllocation ||
      !q4FinancialExperience ||
      q5InvestmentOptions.length === 0
    ) {
      setErrorMessage('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    setIsLoading(true);
    const clientData = {
      client_name: clientName,
      q1_investment_duration: q1InvestmentDuration,
      q2_investment_purpose: q2InvestmentPurpose,
      q3_investment_allocation: q3InvestmentAllocation,
      q4_financial_experience: q4FinancialExperience,
      q5_investment_options: q5InvestmentOptions,
      q6_observations: q6Observations || null,
    };

    try {
      if (clientId) {
        await axios.put(`http://localhost:5000/client/${clientId}`, clientData, {
          withCredentials: true,
        });
        setToastMessage('Cliente atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:5000/add-client', clientData, {
          withCredentials: true,
        });
        setToastMessage('Cliente adicionado com sucesso!');
      }
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      setToastMessage(error.response?.data?.error || 'Erro ao salvar cliente');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const q1Options = ['Até 1 ano', 'De 1 a 3 anos', 'De 3 a 5 anos', 'Acima de 5 anos'];
  const q2Options = [
    'Preservação de patrimônio',
    'Obter retornos superiores às aplicações tradicionais, tolerando pequenas perdas de parte do patrimônio no curto prazo',
    'Obter retornos superiores às aplicações tradicionais, tolerando possíveis perdas significativas de parte do patrimônio no médio prazo',
    'Crescimento substancial do patrimônio no longo prazo, mesmo que a estratégia possa implicar em perdas expressivas dos recursos investidos',
  ];
  const q3Options = ['Menos de 25%', 'De 25% a 50%', 'De 50% a 75%', 'Acima de 75%'];
  const q4Options = [
    'Não possui nenhuma experiência',
    'Pouca experiência em investimentos em geral',
    'Experiência com investimentos com pouca/média probabilidade de perda',
    'Se sente seguro em tomar decisões de investimentos e esta apto a entender e ponderar os riscos',
  ];
  const q5Options = [
    'Ações',
    'Derivativos/Estruturados',
    'Fundos de Investimentos de Ações e Multimercados',
    'Fundos de Investimentos de Renda Fixa',
    'CDB',
    'Previdência',
    'Títulos Públicos',
    'Imóveis',
    'Poupança',
    'Não realiza investimentos',
  ];

  if (isLoading) {
    return (
      <div 
        className={`suitability-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`suitability-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      
      <div className="suitability-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="suitability-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={clientId ? faEdit : faUserPlus} className="header-icon" />
              <h1>{clientId ? 'Editar Cliente' : 'Novo Cliente'}</h1>
            </div>
            <p>Preencha o questionário de suitability para {clientId ? 'atualizar' : 'adicionar'} o cliente</p>
          </div>
          <div className="header-actions">
            <CustomButton
              onClick={() => navigate('/clients')}
              className="back-button"
              isDarkMode={isDarkMode}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Voltar
            </CustomButton>
          </div>
        </div>

        {/* Formulário */}
        <div className="form-section">
          <CustomCard className="client-info-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <FontAwesomeIcon icon={faUser} />
              <h3>Informações do Cliente</h3>
            </div>
            <CustomInput
              type="text"
              placeholder="Digite o nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
          </CustomCard>

          {/* Questionário */}
          <div className="questions-section">
            <h3>Questionário de Suitability</h3>
            
            <div className="questions-grid">
              {/* Pergunta 1 */}
              <CustomCard className="question-card" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faClock} />
                  <h4>1. Duração Planejada para o Investimento</h4>
                </div>
                <select
                  value={q1InvestmentDuration}
                  onChange={(e) => setQ1InvestmentDuration(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Selecione uma opção</option>
                  {q1Options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </CustomCard>

              {/* Pergunta 2 */}
              <CustomCard className="question-card" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faBullseye} />
                  <h4>2. Principal Objetivo do Investimento</h4>
                </div>
                <select
                  value={q2InvestmentPurpose}
                  onChange={(e) => setQ2InvestmentPurpose(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Selecione uma opção</option>
                  {q2Options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </CustomCard>

              {/* Pergunta 3 */}
              <CustomCard className="question-card" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faPiggyBank} />
                  <h4>3. Percentual do Patrimônio para Investimentos</h4>
                </div>
                <select
                  value={q3InvestmentAllocation}
                  onChange={(e) => setQ3InvestmentAllocation(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Selecione uma opção</option>
                  {q3Options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </CustomCard>

              {/* Pergunta 4 */}
              <CustomCard className="question-card" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <h4>4. Nível de Experiência com Investimentos</h4>
                </div>
                <select
                  value={q4FinancialExperience}
                  onChange={(e) => setQ4FinancialExperience(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Selecione uma opção</option>
                  {q4Options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </CustomCard>

              {/* Pergunta 5 */}
              <CustomCard className="question-card full-width" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faList} />
                  <h4>5. Tipos de Investimentos Realizados ou de Interesse</h4>
                </div>
                <div className="checkbox-grid">
                  {q5Options.map((option) => (
                    <label key={option} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={q5InvestmentOptions.includes(option)}
                        onChange={() => handleQ5Change(option)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">{option}</span>
                    </label>
                  ))}
                </div>
              </CustomCard>

              {/* Observações */}
              <CustomCard className="question-card full-width" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faComments} />
                  <h4>6. Observações Adicionais (Opcional)</h4>
                </div>
                <CustomInput
                  type="text"
                  placeholder="Digite observações adicionais..."
                  value={q6Observations}
                  onChange={(e) => setQ6Observations(e.target.value)}
                  className="input-neon"
                  isDarkMode={isDarkMode}
                />
              </CustomCard>
            </div>
          </div>

          {/* Mensagem de erro */}
          {errorMessage && (
            <div className="error-container">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p className="error-message">{errorMessage}</p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="action-buttons">
            <CustomButton
              onClick={handleSubmit}
              className="save-button"
              isDarkMode={isDarkMode}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} />
              {isLoading ? 'Salvando...' : 'Salvar Cliente'}
            </CustomButton>
            <CustomButton
              onClick={() => navigate('/clients')}
              className="cancel-button"
              isDarkMode={isDarkMode}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancelar
            </CustomButton>
          </div>
        </div>
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

export default Suitability;