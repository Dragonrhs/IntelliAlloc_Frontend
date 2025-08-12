import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faShieldAlt,
  faCalendarAlt,
  faClock,
  faEdit,
  faTrash,
  faArrowLeft,
  faChartLine,
  faBullseye,
  faPiggyBank,
  faGraduationCap,
  faList,
  faComments,
  faCrown,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './ClientDetails.css';

const ClientDetails: React.FC = () => {
  const [client, setClient] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { isDarkMode, toggleTheme, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        setClient(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar cliente:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao carregar cliente');
        setToastMessage('Erro ao carregar dados do cliente');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
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
        setToastMessage('Cliente excluído com sucesso!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          navigate('/clients');
        }, 1500);
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao excluir cliente');
        setToastType('error');
        setShowToast(true);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const getRiskProfileColor = (riskProfile: string) => {
    switch (riskProfile?.toLowerCase()) {
      case 'conservador':
        return '#4caf50';
      case 'moderado':
        return '#ff9800';
      case 'arrojado':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getRiskProfileIcon = (riskProfile: string) => {
    switch (riskProfile?.toLowerCase()) {
      case 'conservador':
        return '🛡️';
      case 'moderado':
        return '⚖️';
      case 'arrojado':
        return '🚀';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div 
        className={`client-details-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div 
        className={`client-details-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h3>Cliente não encontrado</h3>
          <p>O cliente solicitado não foi encontrado ou não existe.</p>
          <CustomButton
            onClick={() => navigate('/clients')}
            className="back-button"
            isDarkMode={isDarkMode}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Voltar para Clientes
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`client-details-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
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
      
      <div className="client-details-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="client-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faUser} className="header-icon" />
              <h1>Detalhes do Cliente</h1>
            </div>
            <p>Informações completas e perfil de investimento</p>
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

        {/* Informações Principais */}
        <div className="main-info-section">
          <CustomCard className="client-profile-card" isDarkMode={isDarkMode}>
            <div className="profile-header">
              <div className="client-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="client-info">
                <h2>{client.client_name}</h2>
                <div className="risk-profile">
                  <span className="risk-icon">
                    {getRiskProfileIcon(client.risk_profile)}
                  </span>
                  <span 
                    className="risk-label"
                    style={{ color: getRiskProfileColor(client.risk_profile) }}
                  >
                    {client.risk_profile || 'Não definido'}
                  </span>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  onClick={handleEdit}
                  className="action-button edit"
                  title="Editar Cliente"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={handleDelete}
                  className="action-button delete"
                  title="Excluir Cliente"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Criado em: {formatDate(client.created_at)}</span>
              </div>
            </div>
          </CustomCard>
        </div>

        {/* Questionário de Suitability */}
        <div className="suitability-section">
          <h3>Questionário de Suitability</h3>
          <div className="questions-grid">
            <CustomCard className="question-card" isDarkMode={isDarkMode}>
              <div className="question-header">
                <FontAwesomeIcon icon={faClock} />
                <h4>1. Duração Planejada para o Investimento</h4>
              </div>
              <p>{client.q1_investment_duration}</p>
            </CustomCard>

            <CustomCard className="question-card" isDarkMode={isDarkMode}>
              <div className="question-header">
                <FontAwesomeIcon icon={faBullseye} />
                <h4>2. Principal Objetivo do Investimento</h4>
              </div>
              <p>{client.q2_investment_purpose}</p>
            </CustomCard>

            <CustomCard className="question-card" isDarkMode={isDarkMode}>
              <div className="question-header">
                <FontAwesomeIcon icon={faPiggyBank} />
                <h4>3. Percentual do Patrimônio Destinado a Investimentos</h4>
              </div>
              <p>{client.q3_investment_allocation}</p>
            </CustomCard>

            <CustomCard className="question-card" isDarkMode={isDarkMode}>
              <div className="question-header">
                <FontAwesomeIcon icon={faGraduationCap} />
                <h4>4. Nível de Experiência com Investimentos</h4>
              </div>
              <p>{client.q4_financial_experience}</p>
            </CustomCard>

            <CustomCard className="question-card full-width" isDarkMode={isDarkMode}>
              <div className="question-header">
                <FontAwesomeIcon icon={faList} />
                <h4>5. Tipos de Investimentos Realizados ou de Interesse</h4>
              </div>
              <div className="investment-options">
                {client.q5_investment_options.map((option: string, index: number) => (
                  <span key={index} className="option-tag">
                    {option}
                  </span>
                ))}
              </div>
            </CustomCard>

            {client.q6_observations && (
              <CustomCard className="question-card full-width" isDarkMode={isDarkMode}>
                <div className="question-header">
                  <FontAwesomeIcon icon={faComments} />
                  <h4>6. Observações Adicionais</h4>
                </div>
                <p>{client.q6_observations}</p>
              </CustomCard>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="error-container">
            <p className="error-message">{errorMessage}</p>
          </div>
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

export default ClientDetails;