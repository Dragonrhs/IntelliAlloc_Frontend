import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FiltroPopup from '../components/FiltroPopup';
import { useTheme } from '../context/ThemeContext';
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
  const [colunaFiltroAberto, setColunaFiltroAberto] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<{ campo: keyof Ativo; direcao: 'asc' | 'desc' }>({
    campo: 'nome',
    direcao: 'asc'
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [filtroButtonRefs, setFiltroButtonRefs] = useState<Record<string, React.RefObject<HTMLButtonElement | null>>>({});

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
    return Object.entries(filtrosAtivos).every(([coluna, valores]) => {
      if (!valores || valores.length === 0) return true;
      const valorAtivo = ativo[coluna as keyof Ativo];
      if (!valorAtivo) return false;
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
        role={undefined}
      />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                {renderColuna('nome', 'Nome')}
                {renderColuna('classe', 'Classe')}
                {renderColuna('emissor', 'Emissor')}
                {renderColuna('risco_credito', 'Risco')}
                {renderColuna('ticker', 'Ticker')}
                {renderColuna('isin', 'ISIN')}
                {renderColuna('cnpj', 'CNPJ')}
                {renderColuna('gestora', 'Gestora')}
                {renderColuna('data', 'Data')}
              </tr>
            </thead>
            <tbody>
              {ativosPaginados.map((ativo) => (
                <tr key={ativo.id}>
                  <td>{ativo.nome}</td>
                  <td>{ativo.classe}</td>
                  <td>{ativo.emissor}</td>
                  <td>{ativo.risco_credito}</td>
                  <td>{ativo.ticker || '-'}</td>
                  <td>{ativo.isin || '-'}</td>
                  <td>{formatarCNPJ(ativo.cnpj)}</td>
                  <td>{ativo.gestora}</td>
                  <td>{formatarData(ativo.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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