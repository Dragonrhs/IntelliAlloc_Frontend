import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FiltroPopup from '../components/FiltroPopup';
import TextHighlight from '../components/TextHighlight';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './ConsultarAtivos.css';

interface Ativo {
  id: number;
  nome: string;
  classe: string;
  canal: string;
  emissor: string;
  risco_credito: string;
  ticker: string | null;
  isin: string | null;
  cnpj: string | null;
  gestora: string;
  prazo_total: number;
  data: string;
  status: string;
  emissor_emissao: string | null;
  analista_responsavel: string;
  perfil: string;
  master_feeder: string | null;
  restrito_alocacao: string | null;
}

const ConsultarAtivos: React.FC = () => {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, string[]>>({});
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [colunaFiltroAberto, setColunaFiltroAberto] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<{ campo: keyof Ativo; direcao: 'asc' | 'desc' }>({
    campo: 'nome',
    direcao: 'asc'
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [filtroButtonRefs, setFiltroButtonRefs] = useState<Record<string, React.RefObject<HTMLButtonElement | null>>>({});
  const [colunasVisiveis, setColunasVisiveis] = useState<Record<string, boolean>>({
    nome: true,
    classe: true,
    canal: true,
    emissor: true,
    risco_credito: true,
    ticker: true,
    isin: true,
    cnpj: true,
    gestora: true,
    prazo_total: true,
    data: true,
    status: true,
    emissor_emissao: true,
    analista_responsavel: true,
    perfil: true,
    master_feeder: true,
    restrito_alocacao: true
  });
  const [showColunasPopup, setShowColunasPopup] = useState(false);

  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const carregarAtivos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ativos/buscar', {
          params: {
            tipo: 'todos',
            valor: ''
          },
          withCredentials: true
        });
        
        if (response.data && response.data.ativos) {
          setAtivos(response.data.ativos);
        } else {
          throw new Error('Formato de resposta inválido');
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Erro ao carregar ativos:', error);
        setError(error.response?.data?.error || 'Erro ao carregar ativos. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    carregarAtivos();
  }, []);

  useEffect(() => {
    // Criar refs para cada coluna
    const refs: Record<string, React.RefObject<HTMLButtonElement | null>> = {};
    ['nome', 'classe', 'emissor', 'risco_credito', 'ticker', 'isin', 'cnpj', 'gestora', 'data'].forEach(coluna => {
      refs[coluna] = React.createRef();
    });
    setFiltroButtonRefs(refs);
  }, []);

  const formatarData = (data: string) => {
    try {
      if (!data) return '-';
      return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const formatarCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    try {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } catch (error) {
      console.error('Erro ao formatar CNPJ:', error);
      return cnpj;
    }
  };

  const handleAbrirFiltro = (coluna: keyof Ativo, event: React.MouseEvent) => {
    event.stopPropagation();
    setColunaFiltroAberto(coluna);
  };

  const handleFecharFiltro = () => {
    setColunaFiltroAberto(null);
  };

  const handleAplicarFiltro = (coluna: keyof Ativo, valores: string[]) => {
    setFiltrosAtivos(prev => ({
      ...prev,
      [coluna]: valores
    }));
    setPaginaAtual(1);
  };

  const ativosFiltrados = ativos.filter(ativo => {
    // Primeiro aplica o filtro de busca global
    if (buscaGlobal) {
      const termoBusca = buscaGlobal.toLowerCase();
      const encontrado = Object.entries(ativo).some(([chave, valor]) => {
        if (valor === null || valor === undefined) return false;
        return String(valor).toLowerCase().includes(termoBusca);
      });
      if (!encontrado) return false;
    }

    // Depois aplica os filtros específicos das colunas
    return Object.entries(filtrosAtivos).every(([coluna, valores]) => {
      if (!valores || valores.length === 0) return true;
      const valorAtivo = ativo[coluna as keyof Ativo];
      
      if (valores.includes('-')) {
        return !valorAtivo || valorAtivo === '' || valorAtivo === '-' || valores.includes(String(valorAtivo));
      }
      
      return valores.includes(String(valorAtivo));
    });
  });

  const ativosOrdenados = [...ativosFiltrados].sort((a, b) => {
    const valorA = a[ordenacao.campo];
    const valorB = b[ordenacao.campo];

    if (valorA === null) return 1;
    if (valorB === null) return -1;

    if (typeof valorA === 'string' && typeof valorB === 'string') {
      return ordenacao.direcao === 'asc'
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA);
    }

    return ordenacao.direcao === 'asc'
      ? Number(valorA) - Number(valorB)
      : Number(valorB) - Number(valorA);
  });

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const ativosPaginados = ativosOrdenados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(ativosFiltrados.length / itensPorPagina);

  const handleOrdenacao = (campo: keyof Ativo) => {
    setOrdenacao({
      campo,
      direcao: ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc'
    });
  };

  const toggleColuna = (coluna: string) => {
    setColunasVisiveis(prev => ({
      ...prev,
      [coluna]: !prev[coluna]
    }));
  };

  const renderColunasPopup = () => {
    if (!showColunasPopup) return null;

    return (
      <div className="colunas-popup">
        <div className="colunas-popup-content">
          <h3>Colunas Visíveis</h3>
          <div className="colunas-list">
            {Object.entries(colunasVisiveis).map(([coluna, visivel]) => (
              <label key={coluna} className="coluna-checkbox">
                <input
                  type="checkbox"
                  checked={visivel}
                  onChange={() => toggleColuna(coluna)}
                />
                {coluna.charAt(0).toUpperCase() + coluna.slice(1).replace('_', ' ')}
              </label>
            ))}
          </div>
          <button 
            className="close-button"
            onClick={() => setShowColunasPopup(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  const renderColuna = (coluna: keyof Ativo, label: string) => {
    const temFiltroAtivo = filtrosAtivos[coluna]?.length > 0;
    
    return (
      <th 
        onClick={() => handleOrdenacao(coluna)}
        className={`coluna-header ${temFiltroAtivo ? 'filtro-ativo' : ''}`}
      >
        <div className="coluna-content">
          <span>{label}</span>
          <div className="coluna-icons">
            {ordenacao.campo === coluna && (
              <span className="ordem-icon">
                {ordenacao.direcao === 'asc' ? '↑' : '↓'}
              </span>
            )}
            <button
              ref={filtroButtonRefs[coluna]}
              className="filtro-button"
              onClick={(e) => handleAbrirFiltro(coluna, e)}
            >
              {temFiltroAtivo ? '🔍' : '⚡'}
            </button>
          </div>
        </div>
        {colunaFiltroAberto === coluna && (
          <FiltroPopup
            coluna={label}
            valores={ativos.map(a => a[coluna])}
            filtrosAtivos={filtrosAtivos[coluna] || []}
            isDarkMode={isDarkMode}
            onAplicarFiltro={(valores) => handleAplicarFiltro(coluna, valores)}
            onClose={handleFecharFiltro}
            buttonRef={filtroButtonRefs[coluna]}
          />
        )}
      </th>
    );
  };

  if (loading) {
    return (
      <div className={`consultar-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`consultar-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className={`consultar-ativos-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar
        showAvatar={true}
        isDarkMode={isDarkMode}
      />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="tabela-header">
          <div className="busca-global-container">
            <input
              type="text"
              placeholder="Buscar em todas as colunas..."
              value={buscaGlobal}
              onChange={(e) => setBuscaGlobal(e.target.value)}
              className={`busca-global-input ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            />
          </div>
          <div className="acoes-container">
            <button 
              className="colunas-button"
              onClick={() => setShowColunasPopup(true)}
            >
              Configurar Colunas
            </button>
          </div>
        </div>
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                {colunasVisiveis.nome && renderColuna('nome', 'Nome')}
                {colunasVisiveis.classe && renderColuna('classe', 'Classe')}
                {colunasVisiveis.canal && renderColuna('canal', 'Canal')}
                {colunasVisiveis.emissor && renderColuna('emissor', 'Emissor')}
                {colunasVisiveis.risco_credito && renderColuna('risco_credito', 'Risco')}
                {colunasVisiveis.ticker && renderColuna('ticker', 'Ticker')}
                {colunasVisiveis.isin && renderColuna('isin', 'ISIN')}
                {colunasVisiveis.cnpj && renderColuna('cnpj', 'CNPJ')}
                {colunasVisiveis.gestora && renderColuna('gestora', 'Gestora')}
                {colunasVisiveis.prazo_total && renderColuna('prazo_total', 'Prazo Total')}
                {colunasVisiveis.data && renderColuna('data', 'Data')}
                {colunasVisiveis.status && renderColuna('status', 'Status')}
                {colunasVisiveis.emissor_emissao && renderColuna('emissor_emissao', 'Emissor/Emissão')}
                {colunasVisiveis.analista_responsavel && renderColuna('analista_responsavel', 'Analista')}
                {colunasVisiveis.perfil && renderColuna('perfil', 'Perfil')}
                {colunasVisiveis.master_feeder && renderColuna('master_feeder', 'Master/Feeder')}
                {colunasVisiveis.restrito_alocacao && renderColuna('restrito_alocacao', 'Restrito')}
              </tr>
            </thead>
            <tbody>
              {ativosPaginados.map((ativo) => (
                <tr key={ativo.id}>
                  {colunasVisiveis.nome && <td><TextHighlight text={ativo.nome} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.classe && <td><TextHighlight text={ativo.classe} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.canal && <td><TextHighlight text={ativo.canal} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.emissor && <td><TextHighlight text={ativo.emissor} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.risco_credito && <td><TextHighlight text={ativo.risco_credito} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.ticker && <td><TextHighlight text={ativo.ticker} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.isin && <td><TextHighlight text={ativo.isin} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.cnpj && <td><TextHighlight text={formatarCNPJ(ativo.cnpj)} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.gestora && <td><TextHighlight text={ativo.gestora} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.prazo_total && <td><TextHighlight text={ativo.prazo_total} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.data && <td><TextHighlight text={formatarData(ativo.data)} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.status && <td><TextHighlight text={ativo.status} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.emissor_emissao && <td><TextHighlight text={ativo.emissor_emissao} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.analista_responsavel && <td><TextHighlight text={ativo.analista_responsavel} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.perfil && <td><TextHighlight text={ativo.perfil} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.master_feeder && <td><TextHighlight text={ativo.master_feeder} searchTerm={buscaGlobal} /></td>}
                  {colunasVisiveis.restrito_alocacao && <td><TextHighlight text={ativo.restrito_alocacao} searchTerm={buscaGlobal} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderColunasPopup()}
        <div className="paginacao">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultarAtivos; 