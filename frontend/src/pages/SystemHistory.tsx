import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHistory,
  faClock,
  faUser,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faCalendarAlt,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faDatabase,
  faServer,
  faCog,
  faShieldAlt,
  faUserShield,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './SystemHistory.css';

const SystemHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [clientNames, setClientNames] = useState<{[key: number]: string}>({});
  const [isLoadingClientNames, setIsLoadingClientNames] = useState(false);
  const [formattedDetails, setFormattedDetails] = useState<{[key: string]: string}>({});
  const fetchedCarteiraIds = useRef<Set<number>>(new Set());
  const hasInitializedClientNames = useRef<boolean>(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled } = useTheme();

  const getClientNameByCarteiraId = async (carteiraId: number) => {
    if (clientNames[carteiraId]) {
      return clientNames[carteiraId];
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/carteira-cliente/${carteiraId}/cliente`, {
        withCredentials: true,
        timeout: 5000
      });
      
      const clientName = response.data.client_name;
      setClientNames(prev => ({
        ...prev,
        [carteiraId]: clientName
      }));
      
      return clientName;
    } catch (error: any) {
      console.warn(`Erro ao buscar nome do cliente para carteira ${carteiraId}:`, error);
      if (error.code === 'ERR_NETWORK') {
        console.warn('Erro de rede ao buscar nome do cliente');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Erro de autenticação ao buscar nome do cliente');
      }
      return `Carteira ID: ${carteiraId}`;
    }
  };

  const fetchClientNames = useCallback(async () => {
    if (hasInitializedClientNames.current) return;
    
    const carteiraIds = new Set<number>();
    
    // Extrair todos os carteira_ids únicos do histórico
    history.forEach(action => {
      if (action.details) {
        try {
          const parsed = JSON.parse(action.details);
          if (parsed.carteira_id && !carteiraIds.has(parsed.carteira_id)) {
            carteiraIds.add(parsed.carteira_id);
          }
        } catch (error) {
          // Ignorar se não for JSON válido
        }
      }
    });

    // Buscar nomes dos clientes sequencialmente
    for (const carteiraId of carteiraIds) {
      if (!fetchedCarteiraIds.current.has(carteiraId)) {
        fetchedCarteiraIds.current.add(carteiraId);
        await getClientNameByCarteiraId(carteiraId);
      }
    }
    
    hasInitializedClientNames.current = true;
  }, [history]);

  useEffect(() => {
    const fetchSystemHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/system-history', {
          withCredentials: true,
        });
        console.log('Histórico do sistema:', response.data.history);
        setHistory(response.data.history);
        setFilteredHistory(response.data.history);
        setClientNames({}); // Reset client names when new history is loaded
        setFormattedDetails({}); // Reset formatted details when new history is loaded
        fetchedCarteiraIds.current.clear(); // Reset fetched carteira IDs
        hasInitializedClientNames.current = false; // Reset initialization flag
        setToastMessage('Histórico do sistema carregado com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        console.error('Erro ao buscar histórico do sistema:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao buscar histórico do sistema');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSystemHistory();
  }, []);

  useEffect(() => {
    let filtered = history;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de ação
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.action_type === filterBy);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, filterBy]);

  // Buscar nomes dos clientes quando o histórico mudar
  useEffect(() => {
    if (history.length > 0 && !hasInitializedClientNames.current) {
      fetchClientNames();
    }
  }, [history.length, fetchClientNames]);

  // Processar detalhes formatados quando o histórico ou nomes de clientes mudarem
  useEffect(() => {
    const processFormattedDetails = async () => {
      setIsLoadingClientNames(true);
      const newFormattedDetails: {[key: string]: string} = {};
      
      for (const action of history) {
        if (action.details) {
          const formatted = await formatDetails(action.details);
          newFormattedDetails[action.id || action.action_date] = formatted;
        }
      }
      
      setFormattedDetails(newFormattedDetails);
      setIsLoadingClientNames(false);
    };

    if (history.length > 0) {
      processFormattedDetails();
    }
  }, [history, clientNames]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'INSERT':
        return faPlus;
      case 'UPDATE':
        return faEdit;
      case 'DELETE':
        return faTrash;
      default:
        return faInfoCircle;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'INSERT':
        return '#4caf50';
      case 'UPDATE':
        return '#ff9800';
      case 'DELETE':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'INSERT':
        return 'Inserção';
      case 'UPDATE':
        return 'Edição';
      case 'DELETE':
        return 'Exclusão';
      default:
        return actionType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetails = async (details: string) => {
    if (!details) return 'Detalhes indisponíveis';
    
    try {
      // Tentar fazer parse do JSON
      const parsed = JSON.parse(details);
      
      // Formatação específica para diferentes tipos de dados
      if (parsed.acao) {
        let formatted = `Ação: ${parsed.acao}\n`;
        
        if (parsed.mes_referencia) {
          formatted += `Mês de Referência: ${parsed.mes_referencia}\n`;
        }
        
        if (parsed.perfil_ponderado) {
          formatted += `\nPerfil Ponderado:\n`;
          if (parsed.perfil_ponderado.perfil_principal) {
            formatted += `  • Principal: ${parsed.perfil_ponderado.perfil_principal} (${(parsed.perfil_ponderado.peso_principal * 100).toFixed(0)}%)\n`;
          }
          if (parsed.perfil_ponderado.perfil_secundario) {
            formatted += `  • Secundário: ${parsed.perfil_ponderado.perfil_secundario} (${(parsed.perfil_ponderado.peso_secundario * 100).toFixed(0)}%)\n`;
          }
        }
        
        if (parsed.carteira_id) {
          const clientName = clientNames[parsed.carteira_id] || `Carteira ID: ${parsed.carteira_id}`;
          formatted += `\nCliente: ${clientName}`;
        }
        
        return formatted;
      }
      
      // Para outros tipos de JSON, usar formatação padrão
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      // Se não for JSON válido, retornar o texto original
      return details;
    }
  };

  const getStats = () => {
    const total = history.length;
    const insertions = history.filter(item => item.action_type === 'INSERT').length;
    const updates = history.filter(item => item.action_type === 'UPDATE').length;
    const deletions = history.filter(item => item.action_type === 'DELETE').length;

    return [
      { label: 'Total de Ações', value: total, icon: faHistory, color: '#667eea' },
      { label: 'Inserções', value: insertions, icon: faPlus, color: '#4caf50' },
      { label: 'Edições', value: updates, icon: faEdit, color: '#ff9800' },
      { label: 'Exclusões', value: deletions, icon: faTrash, color: '#f44336' }
    ];
  };

  if (isLoading) {
    return (
      <div className={`system-history-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando histórico do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`system-history-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="system-history-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="system-history-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faServer} className="header-icon" />
              <h1>Histórico do Sistema</h1>
            </div>
            <p>Acompanhe todas as ações realizadas no sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-section">
          <div className="stats-grid">
            {getStats().map((stat, index) => (
              <div key={index} className="stat-card" style={{ '--card-color': stat.color } as React.CSSProperties}>
                <div className="stat-icon">
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por ação, detalhes ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas as ações</option>
              <option value="INSERT">Apenas inserções</option>
              <option value="UPDATE">Apenas edições</option>
              <option value="DELETE">Apenas exclusões</option>
            </select>
          </div>
        </div>

        {/* Lista de histórico */}
        <div className="history-list-section">
          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faHistory} className="empty-icon" />
              <h3>Nenhuma ação encontrada</h3>
              <p>
                {searchTerm || filterBy !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Ainda não há ações registradas no sistema'
                }
              </p>
            </div>
          ) : (
            <div className="history-grid">
              {filteredHistory.map((action, index) => (
                <CustomCard key={action.id || index} className="history-card" isDarkMode={isDarkMode}>
                  <div className="action-header">
                    <div className="action-icon" style={{ backgroundColor: getActionColor(action.action_type) }}>
                      <FontAwesomeIcon icon={getActionIcon(action.action_type)} />
                    </div>
                    <div className="action-info">
                      <h4>{getActionLabel(action.action_type)}</h4>
                      <span className="action-date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(action.action_date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="action-details">
                    <p>
                      {isLoadingClientNames && !formattedDetails[action.id || action.action_date] 
                        ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faSpinner} style={{ animation: 'spin 1s linear infinite' }} />
                            Carregando detalhes...
                          </span>
                        )
                        : formattedDetails[action.id || action.action_date] || 'Detalhes indisponíveis'
                      }
                    </p>
                  </div>
                  
                  {action.username && (
                    <div className="action-user">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{action.username}</span>
                    </div>
                  )}
                </CustomCard>
              ))}
            </div>
          )}
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

export default SystemHistory;