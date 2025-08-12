import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCalendarAlt,
  faTag,
  faBuilding,
  faCheckCircle,
  faClock,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CustomCard from '../components/CustomCard';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './HistoricoAtivosList.css';

interface Ativo {
  id: number;
  nome: string;
  classe: string;
  canal: string;
  emissor: string;
  risco_credito: string;
  ticker: string | null;
  isin: string | null;
  cnpj: string;
  gestora: string;
  prazo_total: number;
  data: string;
  status: string;
  action_date?: string; // Data da última ação no histórico
}

interface Filtros {
  busca: string;
  classe: string;
  status: string;
  dataAnaliseInicio: string;
  dataAnaliseFim: string;
  dataAcaoInicio: string;
  dataAcaoFim: string;
  gestora: string;
}

interface ResumoAtividades {
  classificacoes: number;
  atualizacoes_classificacao: number;
  importacoes: number;
  atualizacoes: number;
  total: number;
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

const HistoricoAtivosList: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();
  const { userRole } = useUser();
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [ativosFiltrados, setAtivosFiltrados] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [resumoDiario, setResumoDiario] = useState<ResumoAtividades>({
    classificacoes: 0,
    atualizacoes_classificacao: 0,
    importacoes: 0,
    atualizacoes: 0,
    total: 0
  });
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    classe: '',
    status: '',
    dataAnaliseInicio: '',
    dataAnaliseFim: '',
    dataAcaoInicio: '',
    dataAcaoFim: '',
    gestora: ''
  });

  // Lista de classes e gestoras únicas para os filtros
  const [classesUnicas, setClassesUnicas] = useState<string[]>([]);
  const [gestorasUnicas, setGestorasUnicas] = useState<string[]>([]);

  useEffect(() => {
    const fetchAtivos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ativos', {
          withCredentials: true
        });
        
        const ativosData = response.data.ativos as Ativo[];
        
        // Ordenar ativos por data de modificação (mais recente primeiro)
        const ativosOrdenados = ativosData.sort((a, b) => {
          const dataA = a.action_date ? new Date(a.action_date) : new Date(a.data);
          const dataB = b.action_date ? new Date(b.action_date) : new Date(b.data);
          return dataB.getTime() - dataA.getTime();
        });

        setAtivos(ativosOrdenados);
        setAtivosFiltrados(ativosOrdenados);

        // Extrair classes e gestoras únicas com tipagem correta
        const classes = Array.from(new Set(ativosData.map(a => a.classe)));
        const gestoras = Array.from(new Set(ativosData.map(a => a.gestora)));
        
        setClassesUnicas(classes);
        setGestorasUnicas(gestoras);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar ativos');
      } finally {
        setLoading(false);
      }
    };

    fetchAtivos();
    carregarResumoDiario();
  }, []);

  const carregarResumoDiario = async () => {
    try {
      // Obter a data atual no formato YYYY-MM-DD
      const hoje = new Date().toISOString().split('T')[0];
      
      // Fazer uma requisição para obter as atividades do dia atual
      const response = await axios.get(`http://localhost:5000/api/ativos/historico/resumo?date=${hoje}`, { 
        withCredentials: true 
      });
      
      if (response.data && response.data.resumo) {
        setResumoDiario(response.data.resumo);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo diário:', error);
    }
  };

  useEffect(() => {
    const filtrarAtivos = () => {
      let resultado = [...ativos];

      // Filtrar por texto de busca
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase();
        resultado = resultado.filter(ativo => 
          ativo.nome.toLowerCase().includes(termoBusca) ||
          ativo.ticker?.toLowerCase().includes(termoBusca) ||
          ativo.cnpj.includes(termoBusca) ||
          ativo.emissor.toLowerCase().includes(termoBusca)
        );
      }

      // Filtrar por classe
      if (filtros.classe) {
        resultado = resultado.filter(ativo => ativo.classe === filtros.classe);
      }

      // Filtrar por status
      if (filtros.status) {
        resultado = resultado.filter(ativo => ativo.status === filtros.status);
      }

      // Filtrar por gestora
      if (filtros.gestora) {
        resultado = resultado.filter(ativo => ativo.gestora === filtros.gestora);
      }

      // Filtrar por data de análise
      if (filtros.dataAnaliseInicio) {
        const dataInicio = new Date(filtros.dataAnaliseInicio);
        resultado = resultado.filter(ativo => new Date(ativo.data) >= dataInicio);
      }

      if (filtros.dataAnaliseFim) {
        const dataFim = new Date(filtros.dataAnaliseFim);
        dataFim.setHours(23, 59, 59);
        resultado = resultado.filter(ativo => new Date(ativo.data) <= dataFim);
      }

      // Filtrar por data da ação
      if (filtros.dataAcaoInicio) {
        const dataInicio = new Date(filtros.dataAcaoInicio);
        resultado = resultado.filter(ativo => 
          ativo.action_date && new Date(ativo.action_date) >= dataInicio
        );
      }

      if (filtros.dataAcaoFim) {
        const dataFim = new Date(filtros.dataAcaoFim);
        dataFim.setHours(23, 59, 59);
        resultado = resultado.filter(ativo => 
          ativo.action_date && new Date(ativo.action_date) <= dataFim
        );
      }

      // Ordenar resultado por data de modificação (mais recente primeiro)
      resultado.sort((a, b) => {
        const dataA = a.action_date ? new Date(a.action_date) : new Date(a.data);
        const dataB = b.action_date ? new Date(b.action_date) : new Date(b.data);
        return dataB.getTime() - dataA.getTime();
      });

      setAtivosFiltrados(resultado);
    };

    filtrarAtivos();
  }, [filtros, ativos]);

  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleVerHistorico = (ativoId: number) => {
    navigate(`/historico-ativo/${ativoId}`);
  };

  const toggleResumo = () => {
    setMostrarResumo(!mostrarResumo);
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
          <div className="loading">Carregando ativos...</div>
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
                <FontAwesomeIcon icon={faHistory} className="header-icon" />
                <h1>Histórico de Ativos</h1>
              </div>
              <p>Acompanhe o histórico completo de todos os ativos do sistema</p>
            </div>
          </div>

          {/* Filtros modernizados */}
          <div className="filtros-container">
            {/* Busca */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faSearch} />
                <span>Buscar Ativo</span>
              </div>
              <input
                type="text"
                placeholder="Nome, ticker, CNPJ ou emissor..."
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                className="filtro-input"
              />
            </div>

            {/* Classe */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faTag} />
                <span>Classe do Ativo</span>
              </div>
              <select
                value={filtros.classe}
                onChange={(e) => handleFiltroChange('classe', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as classes</option>
                {classesUnicas.map(classe => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </select>
            </div>

            {/* Gestora */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faBuilding} />
                <span>Gestora</span>
              </div>
              <select
                value={filtros.gestora}
                onChange={(e) => handleFiltroChange('gestora', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as gestoras</option>
                {gestorasUnicas.map(gestora => (
                  <option key={gestora} value={gestora}>{gestora}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Status</span>
              </div>
              <select
                value={filtros.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os status</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Em Analise">Em Analise</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>

            {/* Data da Análise */}
            <div className="filtro-grupo data-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Data da Análise</span>
              </div>
              <div className="data-inputs">
                <input
                  type="date"
                  value={filtros.dataAnaliseInicio}
                  onChange={(e) => handleFiltroChange('dataAnaliseInicio', e.target.value)}
                  className="filtro-data"
                />
                <span className="data-separator">até</span>
                <input
                  type="date"
                  value={filtros.dataAnaliseFim}
                  onChange={(e) => handleFiltroChange('dataAnaliseFim', e.target.value)}
                  className="filtro-data"
                />
              </div>
            </div>

            {/* Data da Ação */}
            <div className="filtro-grupo data-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faClock} />
                <span>Data da Ação</span>
              </div>
              <div className="data-inputs">
                <input
                  type="date"
                  value={filtros.dataAcaoInicio}
                  onChange={(e) => handleFiltroChange('dataAcaoInicio', e.target.value)}
                  className="filtro-data"
                />
                <span className="data-separator">até</span>
                <input
                  type="date"
                  value={filtros.dataAcaoFim}
                  onChange={(e) => handleFiltroChange('dataAcaoFim', e.target.value)}
                  className="filtro-data"
                />
              </div>
            </div>
          </div>

          {ativosFiltrados.length === 0 ? (
            <p className="sem-resultados">Nenhum ativo encontrado com os filtros aplicados</p>
          ) : (
            <div className="ativos-list">
              {ativosFiltrados.map((ativo) => (
                <CustomCard key={ativo.id} className="ativo-item" isDarkMode={isDarkMode}>
                  <div className="ativo-info">
                    <h3>{ativo.nome}</h3>
                    <p><strong>Classe:</strong> {ativo.classe}</p>
                    <p><strong>Emissor:</strong> {ativo.emissor}</p>
                    {ativo.ticker && <p><strong>Ticker:</strong> {ativo.ticker}</p>}
                    {ativo.isin && <p><strong>ISIN:</strong> {ativo.isin}</p>}
                    <p><strong>CNPJ:</strong> {ativo.cnpj}</p>
                    <p><strong>Status:</strong> {ativo.status}</p>
                    {ativo.action_date && (
                      <p><strong>Última ação:</strong> {new Date(ativo.action_date).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                  <button 
                    className="ver-historico-button"
                    onClick={() => handleVerHistorico(ativo.id)}
                  >
                    Ver Histórico
                  </button>
                </CustomCard>
              ))}
            </div>
          )}
          
          {/* Botão flutuante para mostrar resumo */}
          <div className="botao-resumo" onClick={toggleResumo}>
            <i className="fas fa-chart-bar"></i>
          </div>

          {/* Modal de resumo diário */}
          {mostrarResumo && (
            <div className="modal-resumo">
              <div 
                className="modal-resumo-conteudo"
                style={{
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  color: isDarkMode ? '#fff' : '#333'
                }}
              >
                <div 
                  className="modal-resumo-header"
                  style={{
                    borderBottomColor: isDarkMode ? '#555' : '#e9ecef'
                  }}
                >
                  <h3 style={{ color: isDarkMode ? '#fff' : '#333' }}>Resumo de Atividades do Dia</h3>
                  <button className="fechar-modal" onClick={toggleResumo}>×</button>
                </div>
                <div className="modal-resumo-body">
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone classificacoes">
                      <i className="fas fa-tags"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.classificacoes}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Classificações
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone atualizacoes-classificacao">
                      <i className="fas fa-tag"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.atualizacoes_classificacao}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Atualizações de Classificação
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone importacoes">
                      <i className="fas fa-file-import"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.importacoes}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Importações de Ativo
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone atualizacoes">
                      <i className="fas fa-edit"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.atualizacoes}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Atualizações de Ativo
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item total"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.1)',
                      borderColor: isDarkMode ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'
                    }}
                  >
                    <div className="resumo-icone total">
                      <i className="fas fa-calculator"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.total}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Total de Atividades
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  className="modal-resumo-footer"
                  style={{
                    borderTopColor: isDarkMode ? '#555' : '#e9ecef',
                    color: isDarkMode ? '#adb5bd' : '#6c757d'
                  }}
                >
                  <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoAtivosList; 