import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCalendarAlt,
  faTag,
  faUser,
  faHistory,
  faClock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CustomCard from '../components/CustomCard';
import { useTheme } from '../context/ThemeContext';
import './HistoricoAtivosList.css';

interface HistoricoItem {
  id: number;
  action_type: string;
  action_date: string;
  changes: string;
  user_name: string;
}

interface Filtros {
  busca: string;
  tipoAcao: string;
  dataInicio: string;
  dataFim: string;
}

const formatarAlteracoes = (changes: string): React.ReactElement => {
  try {
    const dados = JSON.parse(changes);
    return (
      <div className="alteracoes-grid">
        {Object.entries(dados).map(([chave, valor]) => {
          if (valor && String(valor).trim() !== '') {
            return (
              <div key={chave} className="alteracao-item">
                <span className="alteracao-chave">{chave.replace(/_/g, ' ')}:</span>
                <span className="alteracao-valor">{String(valor)}</span>
              </div>
            );
          }
          return null;
        }).filter(item => item !== null)}
      </div>
    );
  } catch (error) {
    return <div>Erro ao formatar alterações</div>;
  }
};

const formatarTipoAcao = (tipo: string): string => {
  switch (tipo) {
    case 'INSERT':
      return 'Inserção';
    case 'UPDATE':
      return 'Atualização';
    case 'IMPORT':
      return 'Importação';
    default:
      return tipo;
  }
};

const formatarData = (data: string): string => {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const HistoricoAtivo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    tipoAcao: '',
    dataInicio: '',
    dataFim: ''
  });

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/ativos/historico/${id}`, {
          withCredentials: true
        });
        setHistorico(response.data.historico);
        setHistoricoFiltrado(response.data.historico);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [id]);

  useEffect(() => {
    const filtrarHistorico = () => {
      let resultado = [...historico];

      // Filtrar por texto de busca
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase();
        resultado = resultado.filter(item => {
          const changes = JSON.parse(item.changes);
          const todosValores = Object.values(changes).join(' ').toLowerCase();
          return todosValores.includes(termoBusca) || 
                 item.user_name.toLowerCase().includes(termoBusca);
        });
      }

      // Filtrar por tipo de ação
      if (filtros.tipoAcao) {
        resultado = resultado.filter(item => item.action_type === filtros.tipoAcao);
      }

      // Filtrar por data
      if (filtros.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio);
        resultado = resultado.filter(item => new Date(item.action_date) >= dataInicio);
      }

      if (filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        dataFim.setHours(23, 59, 59);
        resultado = resultado.filter(item => new Date(item.action_date) <= dataFim);
      }

      setHistoricoFiltrado(resultado);
    };

    filtrarHistorico();
  }, [filtros, historico]);

  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (loading) {
    return (
      <div 
        className={`historico-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={true}
        />
        <div className="main-content">
          <Navbar isDarkMode={isDarkMode} showAvatar={true} />
          <div className="loading">Carregando histórico...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`historico-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={true}
        />
        <div className="main-content">
          <Navbar isDarkMode={isDarkMode} showAvatar={true} />
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`historico-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        toggleSidebar={toggleSidebar} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className={`main-content ${isSidebarExpanded ? 'sidebar-expanded' : ''}`} style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <Navbar isDarkMode={isDarkMode} showAvatar={true} />
        <div className="historico-ativos-content">
          {/* Header modernizado */}
          <div className="historico-header-modern">
            <div className="header-content">
              <div className="header-title">
                <FontAwesomeIcon icon={faFileAlt} className="header-icon" />
                <h1>Histórico do Ativo</h1>
              </div>
              <p>Acompanhe todas as alterações e ações realizadas neste ativo</p>
            </div>
          </div>

          {/* Filtros modernizados */}
          <div className="filtros-container">
            {/* Busca */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faSearch} />
                <span>Buscar Alterações</span>
              </div>
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                className="filtro-input"
              />
            </div>

            {/* Tipo de Ação */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faTag} />
                <span>Tipo de Ação</span>
              </div>
              <select
                value={filtros.tipoAcao}
                onChange={(e) => handleFiltroChange('tipoAcao', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os tipos</option>
                <option value="INSERT">Inserção</option>
                <option value="UPDATE">Atualização</option>
                <option value="IMPORT">Importação</option>
              </select>
            </div>

            {/* Período */}
            <div className="filtro-grupo data-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Período</span>
              </div>
              <div className="data-inputs">
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                  className="filtro-data"
                />
                <span className="data-separator">até</span>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className="filtro-data"
                />
              </div>
            </div>
          </div>

          {historicoFiltrado.length === 0 ? (
            <p className="sem-resultados">Nenhum registro encontrado com os filtros aplicados</p>
          ) : (
            <div className="historico-list">
              {historicoFiltrado.map((item) => (
                <CustomCard key={item.id} className="historico-item" isDarkMode={isDarkMode}>
                  <div className="historico-header-modern">
                    <div className="action-info">
                      <h3>{formatarTipoAcao(item.action_type)}</h3>
                      <div className="action-meta">
                        <span className="historico-data">
                          <FontAwesomeIcon icon={faClock} />
                          {formatarData(item.action_date)}
                        </span>
                        <span className="historico-usuario">
                          <FontAwesomeIcon icon={faUser} />
                          {item.user_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {formatarAlteracoes(item.changes)}
                </CustomCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoAtivo; 