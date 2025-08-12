import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faUser,
  faShieldAlt,
  faCalendarAlt,
  faSearch,
  faFilter,
  faSort
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import CustomInput from '../components/CustomInput';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './ClientsList.css';

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/clients', {
          withCredentials: true,
        });
        setClients(response.data.clients);
        setFilteredClients(response.data.clients);
      } catch (error: any) {
        console.error('Erro ao listar clientes:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao listar clientes');
        setToastMessage('Erro ao carregar clientes');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Filtrar e ordenar clientes
  useEffect(() => {
    let filtered = clients.filter(client =>
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.risk_profile && client.risk_profile.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ordenar clientes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.client_name.localeCompare(b.client_name);
        case 'risk':
          return (a.risk_profile || '').localeCompare(b.risk_profile || '');
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, sortBy]);

  const handleEditClient = (clientId: number) => {
    navigate(`/suitability/${clientId}`);
  };

  const handleViewClient = (clientId: number) => {
    navigate(`/client/${clientId}`);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        setClients(clients.filter((client) => client.id !== clientId));
        setToastMessage('Cliente excluído com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao excluir cliente');
        setToastType('error');
        setShowToast(true);
      }
    }
  };

  const handleAddClient = () => {
    navigate('/suitability');
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
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div 
        className={`clients-list-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`clients-list-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="clients-list-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="clients-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faUsers} className="header-icon" />
              <h1>Gerenciar Clientes</h1>
            </div>
            <p>Visualize e gerencie todos os clientes cadastrados no sistema</p>
          </div>
          <div className="add-client-button-container" title="Novo Cliente">
            <CustomButton
              onClick={handleAddClient}
              className="add-client-button"
              isDarkMode={isDarkMode}
            >
              <FontAwesomeIcon icon={faPlus} />
            </CustomButton>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-content">
              <h3>{clients.length}</h3>
              <p>Total de Clientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div className="stat-content">
              <h3>{clients.filter(c => c.risk_profile === 'Conservador').length}</h3>
              <p>Conservadores</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="stat-content">
              <h3>{clients.filter(c => c.risk_profile === 'Moderado').length}</h3>
              <p>Moderados</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div className="stat-content">
              <h3>{clients.filter(c => {
                const clientDate = new Date(c.created_at);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - clientDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).length}</h3>
              <p>Últimos 30 dias</p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="filters-section">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <CustomInput
              type="text"
              placeholder="Buscar por nome ou perfil de risco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="sort-container">
            <FontAwesomeIcon icon={faSort} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="risk">Ordenar por Perfil</option>
              <option value="date">Ordenar por Data</option>
            </select>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="clients-grid">
          {filteredClients.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faUsers} className="empty-icon" />
              <h3>Nenhum cliente encontrado</h3>
              <p>
                {searchTerm 
                  ? `Nenhum cliente corresponde à busca "${searchTerm}"`
                  : 'Comece adicionando seu primeiro cliente'
                }
              </p>
              {!searchTerm && (
                <CustomButton
                  onClick={handleAddClient}
                  className="add-first-client-button"
                  isDarkMode={isDarkMode}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Adicionar Primeiro Cliente
                </CustomButton>
              )}
            </div>
          ) : (
            filteredClients.map((client) => (
              <CustomCard key={client.id} className="client-card" isDarkMode={isDarkMode}>
                <div className="client-header">
                  <div className="client-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="client-info">
                    <h3>{client.client_name}</h3>
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
                  <div className="client-actions">
                    <button
                      onClick={() => handleViewClient(client.id)}
                      className="action-button view"
                      title="Visualizar"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => handleEditClient(client.id)}
                      className="action-button edit"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="action-button delete"
                      title="Excluir"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <div className="client-details">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Criado em: {formatDate(client.created_at)}</span>
                  </div>
                  {client.q2_investment_purpose && (
                    <div className="detail-item">
                      <FontAwesomeIcon icon={faShieldAlt} />
                      <span>Objetivo: {client.q2_investment_purpose}</span>
                    </div>
                  )}
                </div>
              </CustomCard>
            ))
          )}
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

export default ClientsList;