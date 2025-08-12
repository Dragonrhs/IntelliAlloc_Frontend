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
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './History.css';

const History: React.FC = () => {
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
  const fetchedCarteiraIds = useRef<Set<number>>(new Set());
  const hasInitializedClientNames = useRef(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        // Reset do cache de carteira_ids quando carrega novo histórico
        fetchedCarteiraIds.current.clear();
        hasInitializedClientNames.current = false;
        setClientNames({});
        
        const response = await axios.get('http://localhost:5000/history', {
          withCredentials: true,
        });
        setHistory(response.data.history);
        setFilteredHistory(response.data.history);
        setToastMessage('Histórico carregado com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao buscar histórico');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = history;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de ação
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.action_type === filterBy);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, filterBy]);

  // Função para buscar nomes dos clientes
  const fetchClientNames = useCallback(async () => {
    if (isLoadingClientNames || history.length === 0) return;
    
    setIsLoadingClientNames(true);
    const carteiraIds = new Set<number>();
    
    // Extrair todos os carteira_ids do histórico
    history.forEach(action => {
      try {
        const parsed = JSON.parse(action.details);
        if (parsed.carteira_id && !clientNames[parsed.carteira_id]) {
          carteiraIds.add(parsed.carteira_id);
        }
      } catch (error) {
        // Ignorar erros de parse
      }
    });
    
    // Buscar nomes dos clientes em paralelo
    for (const carteiraId of carteiraIds) {
      try {
        await getClientNameByCarteiraId(carteiraId);
      } catch (error) {
        console.warn(`Erro ao buscar cliente ${carteiraId}:`, error);
      }
    }
    
    setIsLoadingClientNames(false);
  }, [history, isLoadingClientNames, clientNames]);

  // Buscar nomes dos clientes apenas uma vez quando o histórico carrega
  useEffect(() => {
    if (history.length > 0 && !hasInitializedClientNames.current) {
      hasInitializedClientNames.current = true;
      fetchClientNames();
    }
  }, [history.length, fetchClientNames]); // Executa apenas quando o histórico muda

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

  const formatDetails = (details: string) => {
    try {
      // Tentar fazer parse do JSON
      const parsed = JSON.parse(details);
      
      // Se for um objeto com propriedades específicas, formatar adequadamente
      if (parsed.acao) {
        let formattedText = parsed.acao;
        
        // Adicionar informações adicionais se disponíveis
        const additionalInfo = [];
        
        if (parsed.mes_referencia) {
          additionalInfo.push(`Mês: ${parsed.mes_referencia}`);
        }
        
        if (parsed.perfil_ponderado) {
          const perfil = parsed.perfil_ponderado;
          let perfilText = `Perfil: ${perfil.perfil_principal} (${Math.round(perfil.peso_principal * 100)}%)`;
          if (perfil.perfil_secundario && perfil.peso_secundario > 0) {
            perfilText += ` + ${perfil.perfil_secundario} (${Math.round(perfil.peso_secundario * 100)}%)`;
          }
          additionalInfo.push(perfilText);
        }
        
        if (parsed.carteira_id) {
          // Verificar se já temos o nome do cliente em cache
          const clientName = clientNames[parsed.carteira_id];
          if (clientName) {
            additionalInfo.push(`Cliente: ${clientName}`);
          } else {
            // Mostrar carteira_id como fallback
            additionalInfo.push(`Carteira ID: ${parsed.carteira_id}`);
          }
        }
        
        // Se houver informações adicionais, adicionar em uma nova linha
        if (additionalInfo.length > 0) {
          formattedText += `\n${additionalInfo.join(' | ')}`;
        }
        
        return formattedText;
      }
      
      // Se for outro tipo de objeto, tentar formatar de forma mais legível
      if (typeof parsed === 'object') {
        const formattedParts = [];
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'object') {
            formattedParts.push(`${key}: ${JSON.stringify(value)}`);
          } else {
            formattedParts.push(`${key}: ${value}`);
          }
        }
        return formattedParts.join(' | ');
      }
      
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      // Se não for JSON válido, retornar o texto original
      return details;
    }
  };

  const getClientNameByCarteiraId = async (carteiraId: number) => {
    // Verificar se já temos o nome em cache
    if (clientNames[carteiraId]) {
      return clientNames[carteiraId];
    }
    
    try {
      const response = await axios.get(`http://localhost:5000/api/carteira-cliente/${carteiraId}/cliente`, {
        withCredentials: true,
        timeout: 5000 // Timeout de 5 segundos
      });
      
      if (response.data && response.data.client_name) {
        const clientName = response.data.client_name;
        
        // Atualizar o cache de nomes de clientes
        setClientNames(prev => ({
          ...prev,
          [carteiraId]: clientName
        }));
        
        return clientName;
      } else {
        console.warn(`Resposta inválida para cliente ${carteiraId}:`, response.data);
        return null;
      }
    } catch (error: any) {
      // Tratar diferentes tipos de erro
      if (error.code === 'ERR_NETWORK') {
        console.warn(`Erro de rede ao buscar cliente ${carteiraId}:`, error.message);
      } else if (error.response) {
        // Erro de autenticação ou autorização
        if (error.response.status === 401 || error.response.status === 403) {
          console.warn(`Erro de autenticação ao buscar cliente ${carteiraId}. Redirecionando para login...`);
          // Não redirecionar automaticamente, apenas mostrar o carteira_id
          return null;
        } else {
          console.warn(`Erro HTTP ${error.response.status} ao buscar cliente ${carteiraId}:`, error.response.data);
        }
      } else {
        console.error(`Erro ao buscar nome do cliente ${carteiraId}:`, error);
      }
      
      return null;
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
      <div 
        className={`history-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`history-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
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
      
      <div className="history-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="history-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faHistory} className="header-icon" />
              <h1>Histórico de Ações</h1>
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
                    <p>{formatDetails(action.details)}</p>
                  </div>
                  
                  {action.user_name && (
                    <div className="action-user">
                      <FontAwesomeIcon icon={faUser} />
                      <span>{action.user_name}</span>
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

export default History;