import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCalendarAlt,
  faTag,
  faUser,
  faCheckCircle,
  faClock,
  faHistory,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CustomCard from '../components/CustomCard';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import TextHighlight from '../components/TextHighlight';
import './HistoricoClassificacao.css';

interface ClassificacaoHistoryItem {
  id: number;
  action_type: string;
  action_date: string;
  user_name: string;
  user_id: number;
  ativo_id: number;
  ativo_nome: string;
  ativo_classe: string;
  ativo_classe_anterior?: string;
  classe_investimento?: string;
  classe_investimento_anterior?: string;
  indexador_primario?: string;
  indexador_primario_anterior?: string;
  tipo_indexador?: string;
  tipo_indexador_anterior?: string;
  acao?: string;
}

interface ResumoAtividades {
  classificacoesCriadas: number;
  classificacoesAtualizadas: number;
  classificacoesRemovidas: number;
  total: number;
}

const HistoricoClassificacao: React.FC = () => {
  const [historicoItems, setHistoricoItems] = useState<ClassificacaoHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroClasseAtivo, setFiltroClasseAtivo] = useState<string>('');
  const [filtroClasseInvestimento, setFiltroClasseInvestimento] = useState<string>('');
  const [filtroTipoAcao, setFiltroTipoAcao] = useState<string>('');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [dataInicial, setDataInicial] = useState<string>('');
  const [dataFinal, setDataFinal] = useState<string>('');
  const [classesAtivos, setClassesAtivos] = useState<string[]>([]);
  const [classesInvestimento, setClassesInvestimento] = useState<string[]>([]);
  const [tiposAcao, setTiposAcao] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [resumoDiario, setResumoDiario] = useState<ResumoAtividades>({
    classificacoesCriadas: 0,
    classificacoesAtualizadas: 0,
    classificacoesRemovidas: 0,
    total: 0
  });
  
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();
  const { checkPermission } = useUser();
  const itensPorPagina = 10;

  useEffect(() => {
    carregarHistorico();
    carregarResumoDiario();
  }, []);

  useEffect(() => {
    // Atualizar classes disponíveis quando os dados mudarem
    carregarClassesAtivos();
  }, [historicoItems]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      
      // Carregar todos os dados de uma vez para permitir filtros eficientes
      let url = 'http://localhost:5000/api/history/classificacao?limit=10000'; // Limite alto para pegar todos
      
      const response = await axios.get(url, { withCredentials: true });
      
      if (response.data) {
        setHistoricoItems(response.data.history);
        setTotalItems(response.data.history.length);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      setError(error.response?.data?.error || 'Erro ao carregar histórico. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const carregarResumoDiario = async () => {
    try {
      // Obter a data atual no formato YYYY-MM-DD
      const hoje = new Date().toISOString().split('T')[0];
      
      // Fazer uma requisição para obter as atividades do dia atual
      const response = await axios.get(`http://localhost:5000/api/history/classificacao?date=${hoje}`, { 
        withCredentials: true 
      });
      
      if (response.data && response.data.history) {
        const atividadesDoDia = response.data.history;
        
        // Calcular o resumo
        const resumo: ResumoAtividades = {
          classificacoesCriadas: 0,
          classificacoesAtualizadas: 0,
          classificacoesRemovidas: 0,
          total: atividadesDoDia.length
        };
        
        atividadesDoDia.forEach((item: ClassificacaoHistoryItem) => {
          if (item.action_type === 'CLASSIFICACAO') {
            resumo.classificacoesCriadas++;
          } else if (item.action_type === 'UPDATE_CLASSIFICACAO') {
            resumo.classificacoesAtualizadas++;
          } else if (item.action_type === 'DELETE_CLASSIFICACAO') {
            resumo.classificacoesRemovidas++;
          }
        });
        
        setResumoDiario(resumo);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo diário:', error);
    }
  };

  const carregarClassesAtivos = async () => {
    try {
      // Extrair classes únicas dos dados já carregados
      const classes = new Set<string>();
      const classesInv = new Set<string>();
      const tipos = new Set<string>();
      const users = new Set<string>();
      
      historicoItems.forEach(item => {
        if (item.ativo_classe) {
          classes.add(item.ativo_classe);
        }
        if (item.classe_investimento) {
          classesInv.add(item.classe_investimento);
        }
        if (item.action_type) {
          tipos.add(traduzirTipoAcao(item.action_type));
        }
        if (item.user_name) {
          users.add(item.user_name);
        }
      });
      
      setClassesAtivos(Array.from(classes).sort());
      setClassesInvestimento(Array.from(classesInv).sort());
      setTiposAcao(Array.from(tipos).sort());
      setUsuarios(Array.from(users).sort());
    } catch (error) {
      console.error('Erro ao extrair classes de ativos:', error);
    }
  };

  useEffect(() => {
    // Atualizar classes disponíveis quando os dados mudarem
    carregarClassesAtivos();
  }, [historicoItems]);

  const formatarData = (dataString: string) => {
    try {
      // Converter para o formato dd/mm/aaaa hh:mm:ss mantendo os mesmos valores
      const data = new Date(dataString);
      
      // Extrair os componentes da data
      const dia = String(data.getUTCDate()).padStart(2, '0');
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();
      const hora = String(data.getUTCHours()).padStart(2, '0');
      const minuto = String(data.getUTCMinutes()).padStart(2, '0');
      const segundo = String(data.getUTCSeconds()).padStart(2, '0');
      
      // Retornar no formato desejado
      return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
    } catch (error) {
      return dataString;
    }
  };

  const traduzirTipoAcao = (actionType: string) => {
    switch (actionType) {
      case 'CLASSIFICACAO':
        return 'Classificação Criada';
      case 'UPDATE_CLASSIFICACAO':
        return 'Classificação Atualizada';
      case 'DELETE_CLASSIFICACAO':
        return 'Classificação Removida';
      default:
        return actionType;
    }
  };

  const filtrarPorNome = (item: ClassificacaoHistoryItem) => {
    if (!buscaNome) return true;
    
    const termoBusca = buscaNome.toLowerCase();
    return (
      item.user_name.toLowerCase().includes(termoBusca) ||
      (item.ativo_classe && item.ativo_classe.toLowerCase().includes(termoBusca)) ||
      (item.classe_investimento && item.classe_investimento.toLowerCase().includes(termoBusca)) ||
      (item.indexador_primario && item.indexador_primario.toLowerCase().includes(termoBusca)) ||
      (item.tipo_indexador && item.tipo_indexador.toLowerCase().includes(termoBusca)) ||
      traduzirTipoAcao(item.action_type).toLowerCase().includes(termoBusca)
    );
  };

  const filtrarPorClasseAtivo = (item: ClassificacaoHistoryItem) => {
    if (!filtroClasseAtivo) return true;
    return item.ativo_classe === filtroClasseAtivo;
  };

  const filtrarPorClasseInvestimento = (item: ClassificacaoHistoryItem) => {
    if (!filtroClasseInvestimento) return true;
    return item.classe_investimento === filtroClasseInvestimento;
  };

  const filtrarPorTipoAcao = (item: ClassificacaoHistoryItem) => {
    if (!filtroTipoAcao) return true;
    return traduzirTipoAcao(item.action_type) === filtroTipoAcao;
  };

  const filtrarPorUsuario = (item: ClassificacaoHistoryItem) => {
    if (!filtroUsuario) return true;
    return item.user_name === filtroUsuario;
  };

  const filtrarPorData = (item: ClassificacaoHistoryItem) => {
    if (!dataInicial && !dataFinal) return true;
    
    const dataItem = new Date(item.action_date);
    
    if (dataInicial && dataFinal) {
      const dataInicialObj = new Date(dataInicial);
      const dataFinalObj = new Date(dataFinal);
      // Ajustar data final para incluir o dia inteiro
      dataFinalObj.setHours(23, 59, 59, 999);
      return dataItem >= dataInicialObj && dataItem <= dataFinalObj;
    } else if (dataInicial) {
      const dataInicialObj = new Date(dataInicial);
      return dataItem >= dataInicialObj;
    } else if (dataFinal) {
      const dataFinalObj = new Date(dataFinal);
      // Ajustar data final para incluir o dia inteiro
      dataFinalObj.setHours(23, 59, 59, 999);
      return dataItem <= dataFinalObj;
    }
    
    return true;
  };

  const compararValores = (anterior: string | undefined | null, atual: string | undefined | null): boolean => {
    // Se ambos forem vazios ou nulos, são iguais
    if ((!anterior || anterior === '') && (!atual || atual === '')) return true;
    // Se apenas um for vazio ou nulo, são diferentes
    if (!anterior || anterior === '') return false;
    if (!atual || atual === '') return false;
    // Comparação normal
    return anterior === atual;
  };

  const formatarValor = (valor: string | undefined | null): string => {
    if (!valor || valor === '') return 'N/A';
    return valor;
  };

  const aplicarFiltros = () => {
    return historicoItems
      .filter(filtrarPorNome)
      .filter(filtrarPorClasseAtivo)
      .filter(filtrarPorClasseInvestimento)
      .filter(filtrarPorTipoAcao)
      .filter(filtrarPorUsuario)
      .filter(filtrarPorData);
  };

  // Resetar página quando os filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaNome, filtroClasseAtivo, filtroClasseInvestimento, filtroTipoAcao, filtroUsuario, dataInicial, dataFinal]);

  const toggleResumo = () => {
    setMostrarResumo(!mostrarResumo);
  };

  const historicoFiltrado = aplicarFiltros();
  const totalPaginas = Math.ceil(historicoFiltrado.length / itensPorPagina);
  
  // Paginação local dos dados filtrados
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const historicoPaginado = historicoFiltrado.slice(indiceInicial, indiceFinal);

  if (loading && paginaAtual === 1) {
    return (
      <div 
        className={`historico-classificacao-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
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
          <div className="loading">Carregando histórico de classificações...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`historico-classificacao-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
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
        <div className="historico-classificacao-content">
          {error && <div className="error-message">{error}</div>}

          {/* Header modernizado */}
          <div className="historico-header-modern">
            <div className="header-content">
              <div className="header-title">
                <FontAwesomeIcon icon={faHistory} className="header-icon" />
                <h1>Histórico de Classificação</h1>
              </div>
              <p>Acompanhe todas as classificações realizadas no sistema</p>
            </div>
          </div>

          {/* Filtros modernizados */}
          <div className="filtros-container">
            {/* Busca */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faSearch} />
                <span>Buscar</span>
              </div>
              <input
                type="text"
                placeholder="Buscar em todas as colunas..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="filtro-input"
              />
            </div>

            {/* Classe do Ativo */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faTag} />
                <span>Classe do Ativo</span>
              </div>
              <select
                value={filtroClasseAtivo}
                onChange={(e) => setFiltroClasseAtivo(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as classes</option>
                {classesAtivos.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>

            {/* Classe de Investimento */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faFilter} />
                <span>Classe de Investimento</span>
              </div>
              <select
                value={filtroClasseInvestimento}
                onChange={(e) => setFiltroClasseInvestimento(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as classes</option>
                {classesInvestimento.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Ação */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Tipo de Ação</span>
              </div>
              <select
                value={filtroTipoAcao}
                onChange={(e) => setFiltroTipoAcao(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os tipos</option>
                {tiposAcao.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuário */}
            <div className="filtro-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faUser} />
                <span>Usuário</span>
              </div>
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os usuários</option>
                {usuarios.map((usuario) => (
                  <option key={usuario} value={usuario}>
                    {usuario}
                  </option>
                ))}
              </select>
            </div>

            {/* Data da Ação */}
            <div className="filtro-grupo data-grupo">
              <div className="filtro-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Data da Ação</span>
              </div>
              <div className="data-inputs">
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="filtro-data"
                />
                <span className="data-separator">até</span>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="filtro-data"
                />
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            <div className="filtro-grupo limpar-filtros">
              <button 
                onClick={() => {
                  setBuscaNome('');
                  setFiltroClasseAtivo('');
                  setFiltroClasseInvestimento('');
                  setFiltroTipoAcao('');
                  setFiltroUsuario('');
                  setDataInicial('');
                  setDataFinal('');
                }}
                className="btn-limpar-filtros"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Limpar Filtros</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-overlay">Carregando...</div>
          ) : (
            <>
              {historicoFiltrado.length > 0 ? (
                <div className="tabela-container">
                  <table className="tabela-historico">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Ação</th>
                        <th>Classe do Ativo</th>
                        <th>Usuário</th>
                        <th>Classe de Investimento</th>
                        <th>Indexador Primário</th>
                        <th>Tipo de Indexador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoPaginado.map((item) => (
                        <tr key={item.id} className={`acao-${item.action_type.toLowerCase()}`}>
                          <td>{formatarData(item.action_date)}</td>
                          <td>
                            <div className={`tipo-acao ${item.action_type.toLowerCase()}`}>
                              <TextHighlight text={traduzirTipoAcao(item.action_type)} searchTerm={buscaNome} />
                            </div>
                          </td>
                          <td><TextHighlight text={item.ativo_classe} searchTerm={buscaNome} /></td>
                          <td><TextHighlight text={item.user_name} searchTerm={buscaNome} /></td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.classe_investimento_anterior, item.classe_investimento) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">
                                  <TextHighlight text={formatarValor(item.classe_investimento_anterior)} searchTerm={buscaNome} />
                                </span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">
                                  <TextHighlight text={formatarValor(item.classe_investimento)} searchTerm={buscaNome} />
                                </span>
                              </div>
                            ) : (
                              <TextHighlight text={formatarValor(item.classe_investimento)} searchTerm={buscaNome} />
                            )}
                          </td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.indexador_primario_anterior, item.indexador_primario) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">
                                  <TextHighlight text={formatarValor(item.indexador_primario_anterior)} searchTerm={buscaNome} />
                                </span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">
                                  <TextHighlight text={formatarValor(item.indexador_primario)} searchTerm={buscaNome} />
                                </span>
                              </div>
                            ) : (
                              <TextHighlight text={formatarValor(item.indexador_primario)} searchTerm={buscaNome} />
                            )}
                          </td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.tipo_indexador_anterior, item.tipo_indexador) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">
                                  <TextHighlight text={formatarValor(item.tipo_indexador_anterior)} searchTerm={buscaNome} />
                                </span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">
                                  <TextHighlight text={formatarValor(item.tipo_indexador)} searchTerm={buscaNome} />
                                </span>
                              </div>
                            ) : (
                              <TextHighlight text={formatarValor(item.tipo_indexador)} searchTerm={buscaNome} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="sem-resultados">Nenhum registro de classificação encontrado.</div>
              )}

              {totalPaginas > 1 && (
                <div className="paginacao">
                  <button
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {paginaAtual} de {totalPaginas} ({historicoFiltrado.length} registros)
                  </span>
                  <button
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas || loading}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

          {/* Botão flutuante para mostrar resumo */}
          <div className="botao-resumo" onClick={toggleResumo}>
            <FontAwesomeIcon icon={faChartBar} />
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
                    <div className="resumo-icone criadas">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.classificacoesCriadas}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Classificações Criadas
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone atualizadas">
                      <i className="fas fa-edit"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.classificacoesAtualizadas}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Classificações Atualizadas
                      </span>
                    </div>
                  </div>
                  <div 
                    className="resumo-item"
                    style={{
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa'
                    }}
                  >
                    <div className="resumo-icone removidas">
                      <i className="fas fa-trash-alt"></i>
                    </div>
                    <div className="resumo-info">
                      <span 
                        className="resumo-numero"
                        style={{ color: isDarkMode ? '#fff' : '#333' }}
                      >
                        {resumoDiario.classificacoesRemovidas}
                      </span>
                      <span 
                        className="resumo-texto"
                        style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}
                      >
                        Classificações Removidas
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

export default HistoricoClassificacao; 