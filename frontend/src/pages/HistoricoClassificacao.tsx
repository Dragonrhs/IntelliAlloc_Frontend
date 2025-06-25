import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
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

const HistoricoClassificacao: React.FC = () => {
  const [historicoItems, setHistoricoItems] = useState<ClassificacaoHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroClasseAtivo, setFiltroClasseAtivo] = useState<string>('');
  const [dataInicial, setDataInicial] = useState<string>('');
  const [dataFinal, setDataFinal] = useState<string>('');
  const [classesAtivos, setClassesAtivos] = useState<string[]>([]);
  
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { checkPermission } = useUser();
  const itensPorPagina = 10;

  useEffect(() => {
    carregarHistorico();
    carregarClassesAtivos();
  }, [paginaAtual]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const offset = (paginaAtual - 1) * itensPorPagina;
      
      let url = `http://localhost:5000/api/history/classificacao?limit=${itensPorPagina}&offset=${offset}`;
      
      const response = await axios.get(url, { withCredentials: true });
      
      if (response.data) {
        setHistoricoItems(response.data.history);
        setTotalItems(response.data.total);
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

  const carregarClassesAtivos = async () => {
    try {
      // Extrair classes únicas dos dados já carregados
      const classes = new Set<string>();
      historicoItems.forEach(item => {
        if (item.ativo_classe) {
          classes.add(item.ativo_classe);
        }
      });
      setClassesAtivos(Array.from(classes).sort());
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
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
      .filter(filtrarPorData);
  };

  const historicoFiltrado = aplicarFiltros();
  const totalPaginas = Math.ceil(totalItems / itensPorPagina);

  if (loading && paginaAtual === 1) {
    return (
      <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Sidebar 
          isExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={true}
        />
        <div className="content-container">
          <Navbar isDarkMode={isDarkMode} />
          <div className="main-content">
            <div className="loading">Carregando histórico de classificações...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar 
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="content-container">
        <Navbar isDarkMode={isDarkMode} />
        <div className="main-content">
          <h1>Histórico de Classificações</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="filtros-container">
            <div className="filtro-item">
              <label htmlFor="buscaNome">Busca Geral:</label>
              <input
                type="text"
                id="buscaNome"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar em todas as colunas..."
              />
            </div>

            <div className="filtro-item">
              <label htmlFor="filtroClasseAtivo">Classe do Ativo:</label>
              <select
                id="filtroClasseAtivo"
                value={filtroClasseAtivo}
                onChange={(e) => setFiltroClasseAtivo(e.target.value)}
              >
                <option value="">Todas as Classes</option>
                {classesAtivos.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="dataInicial">Data Inicial:</label>
              <input
                type="date"
                id="dataInicial"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>

            <div className="filtro-item">
              <label htmlFor="dataFinal">Data Final:</label>
              <input
                type="date"
                id="dataFinal"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>

            <div className="filtro-item limpar-filtros">
              <button 
                onClick={() => {
                  setBuscaNome('');
                  setFiltroClasseAtivo('');
                  setDataInicial('');
                  setDataFinal('');
                }}
                className="btn-limpar-filtros"
              >
                Limpar Filtros
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
                      {historicoFiltrado.map((item) => (
                        <tr key={item.id} className={`acao-${item.action_type.toLowerCase()}`}>
                          <td>{formatarData(item.action_date)}</td>
                          <td>
                            <div className={`tipo-acao ${item.action_type.toLowerCase()}`}>
                              {traduzirTipoAcao(item.action_type)}
                            </div>
                          </td>
                          <td>{item.ativo_classe}</td>
                          <td>{item.user_name}</td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.classe_investimento_anterior, item.classe_investimento) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">{formatarValor(item.classe_investimento_anterior)}</span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">{formatarValor(item.classe_investimento)}</span>
                              </div>
                            ) : (
                              formatarValor(item.classe_investimento)
                            )}
                          </td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.indexador_primario_anterior, item.indexador_primario) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">{formatarValor(item.indexador_primario_anterior)}</span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">{formatarValor(item.indexador_primario)}</span>
                              </div>
                            ) : (
                              formatarValor(item.indexador_primario)
                            )}
                          </td>
                          <td>
                            {item.action_type === 'UPDATE_CLASSIFICACAO' && 
                             !compararValores(item.tipo_indexador_anterior, item.tipo_indexador) ? (
                              <div className="valor-alterado">
                                <span className="valor-anterior">{formatarValor(item.tipo_indexador_anterior)}</span>
                                <span className="seta-alteracao">→</span>
                                <span className="valor-novo">{formatarValor(item.tipo_indexador)}</span>
                              </div>
                            ) : (
                              formatarValor(item.tipo_indexador)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">Nenhum registro de classificação encontrado.</div>
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
                    Página {paginaAtual} de {totalPaginas}
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
        </div>
      </div>
    </div>
  );
};

export default HistoricoClassificacao; 