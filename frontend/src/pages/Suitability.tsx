import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        try {
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
          setErrorMessage('Erro ao carregar cliente');
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
      } else {
        await axios.post('http://localhost:5000/add-client', clientData, {
          withCredentials: true,
        });
      }
      navigate('/home');
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao salvar cliente');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
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

  return (
    <div className={`suitability-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className="suitability-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>{clientId ? 'Editar Cliente' : 'Adicionar Cliente'}</h2>
        <CustomCard className="suitability-card" isDarkMode={isDarkMode}>
          <CustomInput
            type="text"
            placeholder="Digite o nome do cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="input-neon"
            isDarkMode={isDarkMode}
          />
          <div className="suitability-field">
            <label>1. Qual a duração planejada para o investimento? *</label>
            <select
              value={q1InvestmentDuration}
              onChange={(e) => setQ1InvestmentDuration(e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {q1Options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="suitability-field">
            <label>2. Qual o principal objetivo do investimento? *</label>
            <select
              value={q2InvestmentPurpose}
              onChange={(e) => setQ2InvestmentPurpose(e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {q2Options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="suitability-field">
            <label>3. Qual percentual do seu patrimônio será destinado a investimentos? *</label>
            <select
              value={q3InvestmentAllocation}
              onChange={(e) => setQ3InvestmentAllocation(e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {q3Options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="suitability-field">
            <label>4. Qual o seu nível de experiência com investimentos? *</label>
            <select
              value={q4FinancialExperience}
              onChange={(e) => setQ4FinancialExperience(e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {q4Options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="suitability-field">
            <label>5. Quais tipos de investimentos você já realizou ou tem interesse? (Selecione todas as opções aplicáveis) *</label>
            <div className="checkbox-group">
              {q5Options.map((option) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={q5InvestmentOptions.includes(option)}
                    onChange={() => handleQ5Change(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <CustomInput
            type="text"
            placeholder="Observações adicionais"
            value={q6Observations}
            onChange={(e) => setQ6Observations(e.target.value)}
            className="input-neon"
            isDarkMode={isDarkMode}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="suitability-buttons">
            <CustomButton
              onClick={handleSubmit}
              className="suitability-button"
              isDarkMode={isDarkMode}
            >
              Salvar
            </CustomButton>
            <CustomButton
              onClick={() => navigate('/home')}
              className="suitability-button secondary"
              isDarkMode={isDarkMode}
            >
              Cancelar
            </CustomButton>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default Suitability;