import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './ClientDetails.css';

const ClientDetails: React.FC = () => {
  const [client, setClient] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        setClient(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar cliente:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao carregar cliente');
      }
    };
    fetchClient();
  }, [clientId]);

  const handleEdit = () => {
    navigate(`/suitability/${clientId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        navigate('/clients');
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao excluir cliente');
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  if (!client) return <div>Carregando...</div>;

  return (
    <div className={`client-details-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className="client-details-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Detalhes do Cliente</h2>
        <CustomCard className="client-details-card" isDarkMode={isDarkMode}>
          <div className="client-details-field">
            <label>Nome do Cliente:</label>
            <p>{client.client_name}</p>
          </div>
          <div className="client-details-field">
            <label>Perfil:</label>
            <p>{client.risk_profile}</p>
          </div>
          <div className="client-details-field">
            <label>1. Duração Planejada para o Investimento:</label>
            <p>{client.q1_investment_duration}</p>
          </div>
          <div className="client-details-field">
            <label>2. Principal Objetivo do Investimento:</label>
            <p>{client.q2_investment_purpose}</p>
          </div>
          <div className="client-details-field">
            <label>3. Percentual do Patrimônio Destinado a Investimentos:</label>
            <p>{client.q3_investment_allocation}</p>
          </div>
          <div className="client-details-field">
            <label>4. Nível de Experiência com Investimentos:</label>
            <p>{client.q4_financial_experience}</p>
          </div>
          <div className="client-details-field">
            <label>5. Tipos de Investimentos Realizados ou de Interesse:</label>
            <ul>
              {client.q5_investment_options.map((option: string, index: number) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>
          <div className="client-details-field">
            <label>6. Observações Adicionais:</label>
            <p>{client.q6_observations || 'Nenhuma observação'}</p>
          </div>
          <div className="client-details-field">
            <label>Data de Criação:</label>
            <p>{new Date(client.created_at).toLocaleString()}</p>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="client-details-buttons">
            <CustomButton
              onClick={handleEdit}
              className="client-details-button"
              isDarkMode={isDarkMode}
            >
              Editar
            </CustomButton>
            <CustomButton
              onClick={handleDelete}
              className="client-details-button delete"
              isDarkMode={isDarkMode}
            >
              Excluir
            </CustomButton>
            <CustomButton
              onClick={() => navigate('/clients')}
              className="client-details-button secondary"
              isDarkMode={isDarkMode}
            >
              Voltar
            </CustomButton>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default ClientDetails;