import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faUser,
  faCalendarAlt,
  faChartPie,
  faSearch,
  faCog,
  faDownload,
  faFileAlt,
  faFilter,
  faUsers,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faRefresh,
  faPlay,
  faSpinner,
  faTimes,
  faPlus,
  faMinus,
  faChartLine,
  faBalanceScale,
  faRocket,
  faShield,
  faBullseye,
  faCalculator,
  faClipboardList,
  faLightbulb,
  faAward,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './CarteiraCliente.css';

interface Cliente {
  id: number;
  client_name: string;
  risk_profile: string;
  score: number;
  consultor: string;
}

interface Carteira {
  classe_ativo: string;
  banda_inferior: number;
  banda_neutra: number;
  banda_superior: number;
}

interface AtivoCarteira {
  classe_ativo: string;
  ativo_id: number | null;
  ativo_nome: string;
  ticker: string;
  isin: string | null;
  cnpj: string | null;
  gestora: string | null;
  alocacao: number;
  tipo: string;
  passou_filtros?: boolean;
  periodo_dados?: {
    data_inicial: string;
    data_final: string;
  };
  metricas?: {
    retorno_medio_diario: number;
    retorno_anualizado: number;
    volatilidade_anualizada: number;
    sharpe_ratio: number;
    retorno_total: number;
    max_drawdown: number;
    beta: number;
    var_95: number;
    cvar_95: number;
    periodo_dias: number;
  };
  score_quantitativo?: number;
}

interface PerfilPonderado {
  perfil_principal: string;
  perfil_secundario: string;
  peso_principal: number;
  peso_secundario: number;
}

interface JustificativaAtivo {
  classe_ativo: string;
  ativo_nome: string;
  alocacao_final: number;
  tipo_ativo: string;
  detalhes: {
    alocacao_base: number | string;
    nota_qualitativa: number;
    ajuste_nota: string;
    alocacao_ajustada: number | string;
    bandas_recomendadas: {
      inferior: number | string;
      neutra: number | string;
      superior: number | string;
    };
  };
  justificativa_escolha: string;
}

interface ExplicacoesMetodologia {
  metodologia_geral: {
    titulo: string;
    passos: string[];
  };
  perfil_ponderado: {
    titulo: string;
    explicacao: string;
  };
  otimizacao_alocacao: {
    titulo: string;
    explicacao: string;
  };
  selecao_quantitativa: {
    titulo: string;
    explicacao: string;
  };
  justificativas_ativos: JustificativaAtivo[];
}

interface CarteiraCliente {
  cliente_id: number;
  cliente_nome: string;
  perfil_risco: string;
  score_suitability: number;
  perfil_ponderado: PerfilPonderado;
  mes_referencia: string;
  notas_qualitativas: { [key: string]: number };
  carteira_original: Carteira[];
  carteira_otimizada: AtivoCarteira[];
  total_alocado: number;
  observacoes: string;
  explicacoes_metodologia?: ExplicacoesMetodologia;
  periodo_dados_carteira?: {
    data_inicial: string;
    data_final: string;
  };
}

const CarteiraCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | ''>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [carteiraGerada, setCarteiraGerada] = useState<CarteiraCliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mostrarTodos, setMostrarTodos] = useState<boolean>(false);
  const [filtroCliente, setFiltroCliente] = useState<string>('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [mensagemCarteira, setMensagemCarteira] = useState<string>('');
  const [dataGeracao, setDataGeracao] = useState<string>('');
  const [carteiraRegenerada, setCarteiraRegenerada] = useState<boolean>(false);
  const [forcarRegeneracao, setForcarRegeneracao] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [relatorioBacktest, setRelatorioBacktest] = useState<any>(null);
  const [maxAtivosPorClasse, setMaxAtivosPorClasse] = useState<{ [classe: string]: number }>({});
  const [apenasPassamFiltros, setApenasPassamFiltros] = useState<boolean>(false);
  const [periodoDias, setPeriodoDias] = useState<number>(365); // Padrão: 1 ano
  
  // Filtros personalizáveis por perfil
  const [filtrosPersonalizados, setFiltrosPersonalizados] = useState<{
    Conservador: { max_volatilidade: number; max_drawdown: number; min_sharpe: number };
    Moderado: { max_volatilidade: number; max_drawdown: number; min_sharpe: number };
    Sofisticado: { max_volatilidade: number; max_drawdown: number; min_sharpe: number };
  }>({
    Conservador: { max_volatilidade: 0.20, max_drawdown: 0.15, min_sharpe: 0.2 },
    Moderado: { max_volatilidade: 0.30, max_drawdown: 0.20, min_sharpe: 0.1 },
    Sofisticado: { max_volatilidade: 0.40, max_drawdown: 0.30, min_sharpe: 0.0 }
  });
  
  const [mostrarFiltrosPersonalizados, setMostrarFiltrosPersonalizados] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();
  const { userRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    carregarMesesDisponiveis();
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [mostrarTodos]);

  // Filtrar clientes quando o filtro ou a lista de clientes mudar
  useEffect(() => {
    if (filtroCliente.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente => 
        cliente.client_name.toLowerCase().includes(filtroCliente.toLowerCase()) ||
        cliente.risk_profile.toLowerCase().includes(filtroCliente.toLowerCase()) ||
        (mostrarTodos && cliente.consultor.toLowerCase().includes(filtroCliente.toLowerCase()))
      );
      setClientesFiltrados(filtrados);
    }
  }, [filtroCliente, clientes, mostrarTodos]);

  // Atualizar maxAtivosPorClasse ao carregar carteira_original
  useEffect(() => {
    if (carteiraGerada && carteiraGerada.carteira_original) {
      const novoMax = { ...maxAtivosPorClasse };
      carteiraGerada.carteira_original.forEach(classe => {
        if (!(classe.classe_ativo in novoMax)) {
          novoMax[classe.classe_ativo] = 4;
        }
      });
      setMaxAtivosPorClasse(novoMax);
    }
  }, [carteiraGerada]);

  const handleChangeMaxAtivos = (classe: string, valor: number) => {
    setMaxAtivosPorClasse(prev => ({ ...prev, [classe]: valor }));
  };

  const handleChangeFiltro = (perfil: string, campo: string, valor: number) => {
    setFiltrosPersonalizados(prev => ({
      ...prev,
      [perfil]: {
        ...prev[perfil as keyof typeof prev],
        [campo]: valor
      }
    }));
  };

  const resetarFiltrosPadrao = () => {
    setFiltrosPersonalizados({
      Conservador: { max_volatilidade: 0.20, max_drawdown: 0.15, min_sharpe: 0.2 },
      Moderado: { max_volatilidade: 0.30, max_drawdown: 0.20, min_sharpe: 0.1 },
      Sofisticado: { max_volatilidade: 0.40, max_drawdown: 0.30, min_sharpe: 0.0 }
    });
  };

  const carregarClientes = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = userRole === 'Admin' && mostrarTodos ? { todos: 'true' } : {};
      const response = await axios.get('http://localhost:5000/api/carteira-cliente/clientes', {
        params,
        withCredentials: true
      });
      
      setClientes(response.data.clientes);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar a lista de clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarMesesDisponiveis = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/carteira-cliente/meses-disponiveis', {
        withCredentials: true
      });
      
      setMesesDisponiveis(response.data.meses);
      
      if (response.data.meses.length > 0) {
        setMesSelecionado(response.data.meses[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar meses disponíveis:', error);
      setError('Erro ao carregar os meses disponíveis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerarCarteira = async () => {
    if (!clienteSelecionado || !mesSelecionado) {
      setError('Selecione um cliente e um mês de referência.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setMensagemCarteira('');
      
      const requestData: any = {
        cliente_id: clienteSelecionado,
        mes_referencia: mesSelecionado,
        forcar_regeneracao: forcarRegeneracao,
        apenas_passam_filtros: apenasPassamFiltros,
        periodo_dias: periodoDias,
        filtros_personalizados: filtrosPersonalizados
      };
      // Enviar max_ativos_por_classe se houver algum valor diferente de 4
      if (Object.keys(maxAtivosPorClasse).length > 0) {
        requestData.max_ativos_por_classe = maxAtivosPorClasse;
      }
      
      console.log('DEBUG: Enviando requisição:', requestData);
      console.log('DEBUG: forcarRegeneracao:', forcarRegeneracao);
      console.log('DEBUG: Tipo de forcarRegeneracao:', typeof forcarRegeneracao);
      
      const response = await axios.post(
        'http://localhost:5000/api/carteira-cliente/gerar',
        requestData,
        { withCredentials: true }
      );
      
      console.log('DEBUG: Resposta recebida:', response.data);
      
      setCarteiraGerada(response.data.carteira_cliente);
      setMensagemCarteira(response.data.mensagem);
      setDataGeracao(response.data.data_geracao);
      setCarteiraRegenerada(response.data.regenerada);
      setForcarRegeneracao(false); // Resetar o flag após a operação
    } catch (error: any) {
      console.error('Erro ao gerar carteira:', error);
      setError(error.response?.data?.error || 'Erro ao gerar a carteira do cliente.');
      setCarteiraGerada(null);
      setMensagemCarteira('');
      setDataGeracao('');
      setCarteiraRegenerada(false);
      setForcarRegeneracao(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerarCarteira = async () => {
    console.log('DEBUG: handleRegenerarCarteira chamado');
    setForcarRegeneracao(true);
    console.log('DEBUG: forcarRegeneracao definido como true');
    
    // Aguardar um tick para garantir que o estado seja atualizado
    await new Promise(resolve => setTimeout(resolve, 0));
    
    if (!clienteSelecionado || !mesSelecionado) {
      setError('Selecione um cliente e um mês de referência.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setMensagemCarteira('');
      
      const requestData: any = {
        cliente_id: clienteSelecionado,
        mes_referencia: mesSelecionado,
        forcar_regeneracao: true,
        apenas_passam_filtros: apenasPassamFiltros,
        periodo_dias: periodoDias,
        filtros_personalizados: filtrosPersonalizados
      };
      if (Object.keys(maxAtivosPorClasse).length > 0) {
        requestData.max_ativos_por_classe = maxAtivosPorClasse;
      }
      
      console.log('DEBUG: Enviando requisição de regeneração:', requestData);
      
      const response = await axios.post(
        'http://localhost:5000/api/carteira-cliente/gerar',
        requestData,
        { withCredentials: true }
      );
      
      console.log('DEBUG: Resposta de regeneração recebida:', response.data);
      
      setCarteiraGerada(response.data.carteira_cliente);
      setMensagemCarteira(response.data.mensagem);
      setDataGeracao(response.data.data_geracao);
      setCarteiraRegenerada(response.data.regenerada);
      setForcarRegeneracao(false); // Resetar o flag após a operação
    } catch (error: any) {
      console.error('Erro ao regenerar carteira:', error);
      setError(error.response?.data?.error || 'Erro ao regenerar a carteira do cliente.');
      setCarteiraGerada(null);
      setMensagemCarteira('');
      setDataGeracao('');
      setCarteiraRegenerada(false);
      setForcarRegeneracao(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMostrarTodos = () => {
    if (userRole === 'Admin') {
      setMostrarTodos(!mostrarTodos);
      // Limpar seleção quando mudar a visualização
      setClienteSelecionado('');
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroCliente(e.target.value);
    // Limpar seleção quando o filtro mudar
    setClienteSelecionado('');
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setClienteSelecionado(value ? Number(value) : '');
  };

  const formatarNotaQualitativa = (nota: number): string => {
    const notas: { [key: number]: string } = {
      [-2]: '-- (Underweight)',
      [-1]: '- (Underweight)',
      [0]: '= (Neutro)',
      [1]: '+ (Overweight)',
      [2]: '++ (Overweight)'
    };
    return notas[nota] || 'N/A';
  };

  const agruparAtivosPorClasse = (carteira: AtivoCarteira[]) => {
    const grupos: { [key: string]: AtivoCarteira[] } = {};
    carteira.forEach(ativo => {
      if (!grupos[ativo.classe_ativo]) {
        grupos[ativo.classe_ativo] = [];
      }
      grupos[ativo.classe_ativo].push(ativo);
    });
    return grupos;
  };

  const handleExportarRelatorio = async () => {
    if (!carteiraGerada) {
      setError('Nenhuma carteira gerada para exportar.');
      return;
    }

    try {
      setIsGeneratingReport(true);
      setError('');
      
      // Buscar o ID da carteira no histórico
      const response = await axios.get(`http://localhost:5000/api/carteira-cliente/historico/${carteiraGerada.cliente_id}`, {
        withCredentials: true
      });
      
      const historico = response.data.historico;
      const carteiraAtual = historico.find((c: any) => 
        c.detalhes.mes_referencia === carteiraGerada.mes_referencia
      );
      
      if (!carteiraAtual) {
        setError('Carteira não encontrada no histórico.');
        return;
      }
      
      // Gerar relatório PDF
      const pdfResponse = await axios.post('http://localhost:5000/api/carteira-cliente/exportar-pdf', {
        carteira_id: carteiraAtual.id
      }, {
        withCredentials: true
      });
      
      // Converter base64 para blob e fazer download
      const pdfBytes = atob(pdfResponse.data.pdf_base64);
      const pdfBlob = new Blob([new Uint8Array(pdfBytes.length).map((_, i) => pdfBytes.charCodeAt(i))], {
        type: 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfResponse.data.nome_arquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Mostrar toast de sucesso
      setToastMessage('Relatório PDF exportado com sucesso!');
      setToastType('success');
      setShowToast(true);
      
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      setError(error.response?.data?.error || 'Erro ao gerar relatório PDF.');
      
      // Mostrar toast de erro
      setToastMessage(error.response?.data?.error || 'Erro ao gerar relatório PDF.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const gerarRelatorioPDF = async (dados: any) => {
    // Implementação básica - em produção seria melhor usar uma biblioteca como jsPDF
    const conteudo = gerarConteudoRelatorio(dados);
    
    // Criar blob e baixar
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_carteira_${carteiraGerada?.cliente_nome}_${carteiraGerada?.mes_referencia}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const gerarConteudoRelatorio = (dados: any) => {
    let conteudo = '';
    
    // Cabeçalho
    conteudo += '='.repeat(80) + '\n';
    conteudo += 'RELATÓRIO DE CARTEIRA DE INVESTIMENTOS\n';
    conteudo += '='.repeat(80) + '\n\n';
    
    // Informações do cliente
    conteudo += 'INFORMAÇÕES DO CLIENTE\n';
    conteudo += '-'.repeat(40) + '\n';
    conteudo += `Nome: ${dados.informacoes_carteira.cliente_nome}\n`;
    conteudo += `Perfil de Risco: ${dados.informacoes_carteira.perfil_risco}\n`;
    conteudo += `Score Suitability: ${dados.informacoes_carteira.score_suitability}\n`;
    conteudo += `Mês de Referência: ${dados.informacoes_carteira.mes_referencia}\n`;
    conteudo += `Data de Geração: ${dados.informacoes_carteira.data_geracao}\n\n`;
    
    // Métricas consolidadas da carteira
    if (dados.metricas_consolidadas) {
      conteudo += 'MÉTRICAS CONSOLIDADAS DA CARTEIRA\n';
      conteudo += '-'.repeat(40) + '\n';
      const m = dados.metricas_consolidadas;
      conteudo += `Retorno Anualizado: ${(m.retorno_anualizado * 100).toFixed(2)}%\n`;
      conteudo += `Volatilidade Anualizada: ${(m.volatilidade_anualizada * 100).toFixed(2)}%\n`;
      conteudo += `Sharpe Ratio: ${m.sharpe_ratio.toFixed(3)}\n`;
      conteudo += `Máximo Drawdown: ${(m.max_drawdown * 100).toFixed(2)}%\n`;
      conteudo += `Beta: ${m.beta.toFixed(3)}\n`;
      conteudo += `VaR 95%: ${(m.var_95 * 100).toFixed(2)}%\n`;
      conteudo += `CVaR 95%: ${(m.cvar_95 * 100).toFixed(2)}%\n`;
      conteudo += `Ativos com Métricas: ${m.total_ativos_com_metricas}/${m.total_ativos}\n\n`;
    }
    
    // Ativos detalhados
    conteudo += 'ATIVOS DA CARTEIRA\n';
    conteudo += '-'.repeat(40) + '\n';
    
    dados.ativos_detalhados.forEach((ativo: any, index: number) => {
      conteudo += `${index + 1}. ${ativo.ativo_nome}\n`;
      conteudo += `   Classe: ${ativo.classe_ativo}\n`;
      conteudo += `   Ticker: ${ativo.ticker}\n`;
      conteudo += `   Alocação: ${ativo.alocacao}%\n`;
      conteudo += `   Tipo: ${ativo.tipo}\n`;
      
      if (ativo.metricas) {
        const met = ativo.metricas;
        conteudo += `   Métricas:\n`;
        conteudo += `     - Retorno Anualizado: ${(met.retorno_anualizado * 100).toFixed(2)}%\n`;
        conteudo += `     - Volatilidade: ${(met.volatilidade_anualizada * 100).toFixed(2)}%\n`;
        conteudo += `     - Sharpe Ratio: ${met.sharpe_ratio.toFixed(3)}\n`;
        conteudo += `     - Máximo Drawdown: ${(met.max_drawdown * 100).toFixed(2)}%\n`;
        conteudo += `     - Beta: ${met.beta.toFixed(3)}\n`;
        conteudo += `     - Score Quantitativo: ${ativo.score_quantitativo?.toFixed(3) || 'N/A'}\n`;
      } else {
        conteudo += `   Métricas: Não disponíveis\n`;
      }
      conteudo += '\n';
    });
    
    // Backtest
    if (dados.backtest) {
      conteudo += 'RESULTADOS DO BACKTEST\n';
      conteudo += '-'.repeat(40) + '\n';
      conteudo += `Período: ${dados.periodo_backtest.data_inicio} a ${dados.periodo_backtest.data_fim}\n\n`;
      
      const bt = dados.backtest.metricas_backtest;
      conteudo += `Retorno Total: ${(bt.retorno_total * 100).toFixed(2)}%\n`;
      conteudo += `Retorno Anualizado: ${(bt.retorno_anualizado * 100).toFixed(2)}%\n`;
      conteudo += `Volatilidade Anualizada: ${(bt.volatilidade_anualizada * 100).toFixed(2)}%\n`;
      conteudo += `Sharpe Ratio: ${bt.sharpe_ratio.toFixed(3)}\n`;
      conteudo += `Máximo Drawdown: ${(bt.max_drawdown * 100).toFixed(2)}%\n`;
      conteudo += `VaR 95%: ${(bt.var_95 * 100).toFixed(2)}%\n`;
      conteudo += `CVaR 95%: ${(bt.cvar_95 * 100).toFixed(2)}%\n`;
      conteudo += `Valor Final: R$ ${bt.valor_final.toFixed(2)}\n`;
      conteudo += `Período (dias): ${bt.periodo_dias}\n\n`;
    }
    
    conteudo += '='.repeat(80) + '\n';
    conteudo += 'FIM DO RELATÓRIO\n';
    conteudo += '='.repeat(80) + '\n';
    
    return conteudo;
  };

  return (
    <div 
      className={`carteira-cliente-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={true} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="content-container">
        <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
          <CustomCard className="carteira-header-card" isDarkMode={isDarkMode}>
            <div className="carteira-header-modern">
              <h1>
                <FontAwesomeIcon icon={faWallet} className="header-icon" />
                Carteira para Cliente
              </h1>
              <p>Configure e gere carteiras otimizadas personalizadas</p>
            </div>
          </CustomCard>
        
        <CustomCard className="form-card" isDarkMode={isDarkMode}>
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faSearch} className="card-icon" />
              Seleção de Cliente
            </h3>
            <p>Selecione o cliente e configure os parâmetros da carteira</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="filtroCliente">
                <FontAwesomeIcon icon={faSearch} className="label-icon" />
                Buscar cliente:
              </label>
              <input
                type="text"
                id="filtroCliente"
                value={filtroCliente}
                onChange={handleFiltroChange}
                placeholder="Digite o nome do cliente, perfil ou consultor"
                className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
              />
            </div>
            
            {userRole === 'Admin' && (
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="mostrarTodos"
                  checked={mostrarTodos}
                  onChange={handleToggleMostrarTodos}
                />
                <label htmlFor="mostrarTodos">
                  <FontAwesomeIcon icon={faUsers} className="label-icon" />
                  Mostrar todos os clientes
                </label>
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clienteSelecionado">
                <FontAwesomeIcon icon={faUser} className="label-icon" />
                Selecione o cliente:
              </label>
              <select
                id="clienteSelecionado"
                value={clienteSelecionado}
                onChange={handleClienteChange}
                className={`custom-select ${isDarkMode ? 'dark-mode' : ''}`}
              >
                <option value="">Selecione um cliente</option>
                {clientesFiltrados.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.client_name} - {cliente.risk_profile} (Score: {cliente.score})
                    {mostrarTodos ? ` (${cliente.consultor})` : ''}
                  </option>
                ))}
              </select>
              {clientesFiltrados.length === 0 && filtroCliente.trim() !== '' && (
                <div className="no-results">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="no-results-icon" />
                  Nenhum cliente encontrado com o filtro aplicado.
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="mesSelecionado">
                <FontAwesomeIcon icon={faCalendarAlt} className="label-icon" />
                Mês de referência:
              </label>
              <select
                id="mesSelecionado"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className={`custom-select ${isDarkMode ? 'dark-mode' : ''}`}
              >
                <option value="">Selecione um mês</option>
                {mesesDisponiveis.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="periodoDias">
                  <FontAwesomeIcon icon={faCalendarAlt} className="label-icon" />
                  Período dos dados (dias):
                </label>
                <input
                  type="number"
                  id="periodoDias"
                  min={30}
                  max={1825}
                  value={periodoDias}
                  onChange={(e) => setPeriodoDias(Number(e.target.value))}
                  className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
                  style={{ width: 120 }}
                />
                <span className="input-help">
                  (30-1825 dias, padrão: 365)
                </span>
              </div>
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="apenasPassamFiltros"
                checked={apenasPassamFiltros}
                onChange={(e) => setApenasPassamFiltros(e.target.checked)}
              />
              <label htmlFor="apenasPassamFiltros">
                <FontAwesomeIcon icon={faFilter} className="label-icon" />
                Apenas ativos que passam nos filtros
              </label>
            </div>
            
            <div className="button-group">
              <button
                onClick={handleGerarCarteira}
                disabled={!clienteSelecionado || !mesSelecionado || isLoading}
                className={`btn-primary ${isDarkMode ? 'dark-mode' : ''}`}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlay} />
                    Gerar Carteira
                  </>
                )}
              </button>
              {carteiraGerada && (
                <button
                  onClick={handleRegenerarCarteira}
                  disabled={!clienteSelecionado || !mesSelecionado || isLoading}
                  className={`btn-secondary ${isDarkMode ? 'dark-mode' : ''}`}
                  title="Forçar regeneração da carteira"
                >
                  <FontAwesomeIcon icon={faRefresh} />
                  Regenerar
                </button>
              )}
            </div>
          </div>
        </CustomCard>
        
        {/* Inputs para definir o máximo de ativos por classe */}
        {carteiraGerada && carteiraGerada.carteira_original && (
          <CustomCard className="max-ativos-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faCog} className="card-icon" />
                Configuração: Máximo de Ativos por Classe
              </h3>
              <p>Configure o número máximo de ativos por classe de investimento</p>
            </div>
            <div className="max-ativos-grid">
              {carteiraGerada.carteira_original.map((classe, idx) => (
                <div key={classe.classe_ativo} className="max-ativos-item">
                  <label>
                    <FontAwesomeIcon icon={faChartPie} className="label-icon" />
                    {classe.classe_ativo}:
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxAtivosPorClasse[classe.classe_ativo] || 4}
                      onChange={e => handleChangeMaxAtivos(classe.classe_ativo, Number(e.target.value))}
                      className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
                      style={{ marginLeft: 8, width: 70 }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="config-help">
              <FontAwesomeIcon icon={faInfoCircle} className="help-icon" />
              Por padrão, cada classe terá até 4 ativos. Você pode ajustar para cada classe antes de gerar ou regenerar a carteira.
            </div>
          </CustomCard>
        )}
        
        {/* Filtros Personalizados */}
        <CustomCard className="filtros-personalizados-card" isDarkMode={isDarkMode}>
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faFilter} className="card-icon" />
              Filtros Personalizados por Perfil de Risco
            </h3>
            <p>Configure critérios quantitativos para cada perfil</p>
          </div>
          <div className="filtros-controls">
            <button
              type="button"
              onClick={() => setMostrarFiltrosPersonalizados(!mostrarFiltrosPersonalizados)}
              className={`btn-toggle ${isDarkMode ? 'dark-mode' : ''}`}
            >
              <FontAwesomeIcon icon={mostrarFiltrosPersonalizados ? faMinus : faPlus} />
              {mostrarFiltrosPersonalizados ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            {mostrarFiltrosPersonalizados && (
              <button
                type="button"
                onClick={resetarFiltrosPadrao}
                className={`btn-reset ${isDarkMode ? 'dark-mode' : ''}`}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Resetar para Padrão
              </button>
            )}
          </div>
          
          {mostrarFiltrosPersonalizados && (
            <div className="filtros-content">
              <div className="filtros-info">
                <p>Configure os filtros quantitativos para cada perfil de risco. Estes filtros determinam quais ativos passam na seleção quantitativa.</p>
              </div>
              
              <div className="filtros-grid">
                {Object.entries(filtrosPersonalizados).map(([perfil, filtros]) => (
                  <div key={perfil} className="filtro-perfil-card">
                    <h5 className={`perfil-titulo perfil-${perfil.toLowerCase()}`}>
                      <FontAwesomeIcon 
                        icon={perfil === 'Conservador' ? faShield : perfil === 'Moderado' ? faBalanceScale : faRocket} 
                        className="perfil-icon" 
                      />
                      {perfil}
                    </h5>
                    <div className="filtros-campos">
                      <div className="filtro-campo">
                        <label>
                          <FontAwesomeIcon icon={faChartLine} className="campo-icon" />
                          Volatilidade Máxima (%):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(filtros.max_volatilidade * 100)}
                          onChange={e => handleChangeFiltro(perfil, 'max_volatilidade', Number(e.target.value) / 100)}
                          className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
                        />
                      </div>
                      <div className="filtro-campo">
                        <label>
                          <FontAwesomeIcon icon={faExclamationTriangle} className="campo-icon" />
                          Drawdown Máximo (%):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(filtros.max_drawdown * 100)}
                          onChange={e => handleChangeFiltro(perfil, 'max_drawdown', Number(e.target.value) / 100)}
                          className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
                        />
                      </div>
                      <div className="filtro-campo">
                        <label>
                          <FontAwesomeIcon icon={faStar} className="campo-icon" />
                          Sharpe Mínimo:
                        </label>
                        <input
                          type="number"
                          min={-20}
                          max={50}
                          step={1}
                          value={Math.round(filtros.min_sharpe * 10)}
                          onChange={e => handleChangeFiltro(perfil, 'min_sharpe', Number(e.target.value) / 10)}
                          className={`custom-input ${isDarkMode ? 'dark-mode' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="filtro-descricao">
                      {perfil === 'Conservador' && 'Filtros rigorosos para preservação de capital'}
                      {perfil === 'Moderado' && 'Filtros equilibrados para crescimento com controle de risco'}
                      {perfil === 'Sofisticado' && 'Filtros flexíveis para potencial de retorno agressivo'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="filtros-observacoes">
                <h6>
                  <FontAwesomeIcon icon={faLightbulb} className="observacoes-icon" />
                  Observações sobre os Filtros:
                </h6>
                <ul>
                  <li><strong>Volatilidade:</strong> Digite o valor em % (ex: 20 = 20%). Mede a variabilidade dos retornos (menor = mais estável)</li>
                  <li><strong>Drawdown:</strong> Digite o valor em % (ex: 15 = 15%). Mede a maior perda histórica (menor = mais seguro)</li>
                  <li><strong>Sharpe Ratio:</strong> Digite o valor multiplicado por 10 (ex: 5 = 0.5). Mede o retorno ajustado ao risco (maior = melhor)</li>
                  <li>Ativos que não passam nos filtros podem ser incluídos se "Apenas ativos que passam nos filtros" estiver desmarcado</li>
                </ul>
              </div>
            </div>
          )}
        </CustomCard>
        
        {carteiraGerada && (
          <CustomCard className="resultado-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faWallet} className="card-icon" />
                Carteira Otimizada Gerada
              </h3>
              <p>Resultado da otimização baseada no perfil do cliente</p>
            </div>
            {mensagemCarteira && (
              <div className={`carteira-status ${carteiraRegenerada ? 'regenerada' : 'recuperada'}`}>
                <span className="status-icon">
                  <FontAwesomeIcon icon={carteiraRegenerada ? faRefresh : faClipboardList} />
                </span>
                <span className="status-text">{mensagemCarteira}</span>
                {dataGeracao && (
                  <span className="data-geracao">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Data: {new Date(dataGeracao).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            )}
            
            {/* Informações do Cliente */}
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faUser} className="info-icon" />
                  Cliente:
                </span>
                <span className="info-value">{carteiraGerada.cliente_nome}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={
                    carteiraGerada.perfil_risco === 'Conservador' ? faShield : 
                    carteiraGerada.perfil_risco === 'Moderado' ? faBalanceScale : faRocket
                  } className="info-icon" />
                  Perfil Principal:
                </span>
                <span className="info-value">{carteiraGerada.perfil_risco}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faAward} className="info-icon" />
                  Score Suitability:
                </span>
                <span className="info-value">{carteiraGerada.score_suitability}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="info-icon" />
                  Mês de referência:
                </span>
                <span className="info-value">{carteiraGerada.mes_referencia}</span>
              </div>
            </div>

            {/* Período dos Dados da Carteira */}
            {carteiraGerada.periodo_dados_carteira && (
              <div className="periodo-carteira">
                <h4>
                  <FontAwesomeIcon icon={faCalendarAlt} className="section-icon" />
                  Período dos Dados Utilizados
                </h4>
                <div className="periodo-info">
                  <div className="periodo-item">
                    <span className="periodo-label">Data Inicial:</span>
                    <span className="periodo-value">{carteiraGerada.periodo_dados_carteira.data_inicial}</span>
                  </div>
                  <div className="periodo-item">
                    <span className="periodo-label">Data Final:</span>
                    <span className="periodo-value">{carteiraGerada.periodo_dados_carteira.data_final}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil Ponderado */}
            <div className="perfil-ponderado">
              <h4>
                <FontAwesomeIcon icon={faBalanceScale} className="section-icon" />
                Análise de Perfil Ponderado
              </h4>
              <div className="perfil-details">
                <p><strong>Perfil Principal:</strong> {carteiraGerada.perfil_ponderado.perfil_principal} (Peso: {carteiraGerada.perfil_ponderado.peso_principal * 100}%)</p>
                <p><strong>Perfil Secundário:</strong> {carteiraGerada.perfil_ponderado.perfil_secundario} (Peso: {carteiraGerada.perfil_ponderado.peso_secundario * 100}%)</p>
              </div>
            </div>

            {/* Notas Qualitativas */}
            <div className="notas-qualitativas">
              <h4>
                <FontAwesomeIcon icon={faStar} className="section-icon" />
                Notas Qualitativas por Classe de Ativo
              </h4>
              <div className="notas-grid">
                {Object.entries(carteiraGerada.notas_qualitativas).map(([classe, nota]) => (
                  <div key={classe} className="nota-item">
                    <span className="classe-nome">{classe}:</span>
                    <span className={`nota-valor nota-${nota}`}>
                      {formatarNotaQualitativa(nota)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carteira Original vs Otimizada */}
            <div className="comparacao-carteiras">
              <h4>
                <FontAwesomeIcon icon={faBalanceScale} className="section-icon" />
                Comparação: Carteira Original vs Otimizada
              </h4>
              <div className="carteira-table-container">
                <table className={`carteira-table ${isDarkMode ? 'dark-mode' : ''}`}>
                  <thead>
                    <tr>
                      <th>Classe de Ativo</th>
                      <th>Banda Inferior (%)</th>
                      <th>Banda Neutra (%)</th>
                      <th>Banda Superior (%)</th>
                      <th>Alocação Otimizada (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carteiraGerada.carteira_original.map((classe, index) => {
                      const alocacaoOtimizada = carteiraGerada.carteira_otimizada
                        .filter(ativo => ativo.classe_ativo === classe.classe_ativo)
                        .reduce((total, ativo) => total + ativo.alocacao, 0);
                      
                      return (
                        <tr key={index}>
                          <td>{classe.classe_ativo}</td>
                          <td>{classe.banda_inferior}</td>
                          <td>{classe.banda_neutra}</td>
                          <td>{classe.banda_superior}</td>
                          <td className="alocacao-otimizada">{alocacaoOtimizada.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Carteira Otimizada Detalhada */}
            <div className="carteira-detalhada">
              <h4>
                <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
                Carteira Otimizada - Ativos Específicos
              </h4>
              {Object.entries(agruparAtivosPorClasse(carteiraGerada.carteira_otimizada)).map(([classe, ativos]) => (
                <div key={classe} className="classe-grupo">
                  <h5 className="classe-titulo">{classe}</h5>
                  <div className="carteira-table-container">
                    <table className={`carteira-table ${isDarkMode ? 'dark-mode' : ''}`}>
                      <thead>
                        <tr>
                          <th>Ativo</th>
                          <th>Ticker/ISIN</th>
                          <th>Gestora</th>
                          <th>Tipo</th>
                          <th>Alocação (%)</th>
                          <th>Filtros</th>
                          <th>Período Dados</th>
                          <th>Métricas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ativos.map((ativo, index) => (
                          <tr key={index}>
                            <td>{ativo.ativo_nome}</td>
                            <td>{ativo.ticker || ativo.isin || 'N/A'}</td>
                            <td>{ativo.gestora || 'N/A'}</td>
                            <td>
                              <span className={`tipo-ativo ${ativo.tipo.includes('Direto') ? 'ativo-direto' : 'ativo-especifico'}`}>
                                {ativo.tipo}
                              </span>
                            </td>
                            <td className="alocacao-valor">{ativo.alocacao}</td>
                            <td>
                              {ativo.passou_filtros !== undefined ? (
                                <span className={`filtro-badge ${ativo.passou_filtros ? 'passou' : 'nao-passou'}`}>
                                  {ativo.passou_filtros ? '✅ Passou' : '⚠️ Fora dos filtros'}
                                </span>
                              ) : (
                                <span className="filtro-badge nao-aplicavel">N/A</span>
                              )}
                            </td>
                            <td>
                              {ativo.periodo_dados ? (
                                <div className="periodo-dados">
                                  <div>Início: {ativo.periodo_dados.data_inicial}</div>
                                  <div>Fim: {ativo.periodo_dados.data_final}</div>
                                </div>
                              ) : (
                                <span className="periodo-nao-disponivel">Não disponível</span>
                              )}
                            </td>
                            <td>
                              {ativo.metricas ? (
                                <div className="metricas-ativo">
                                  {/* Indicadores especiais para ativos de referência */}
                                  {ativo.tipo.startsWith('Ativo Direto') && (
                                    <div className="metrica-item ativo-referencia-indicator">
                                      <span className="metrica-label">📊 {ativo.ticker}:</span>
                                      <span className="metrica-valor ativo-referencia-valor">
                                        Baseado no índice de referência
                                      </span>
                                    </div>
                                  )}
                                  <div className="metrica-item">
                                    <span className="metrica-label">Sharpe:</span>
                                    <span className={`metrica-valor ${ativo.metricas.sharpe_ratio > 0.5 ? 'positivo' : 'negativo'}`}>
                                      {ativo.metricas.sharpe_ratio.toFixed(3)}
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label">Retorno:</span>
                                    <span className={`metrica-valor ${ativo.metricas.retorno_anualizado > 0 ? 'positivo' : 'negativo'}`}>
                                      {(ativo.metricas.retorno_anualizado * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label">Vol:</span>
                                    <span className="metrica-valor">
                                      {(ativo.metricas.volatilidade_anualizada * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label" title="Maior perda histórica">Drawdown:</span>
                                    <span className="metrica-valor">
                                      {(ativo.metricas.max_drawdown * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label" title="Sensibilidade ao mercado">Beta:</span>
                                    <span className="metrica-valor">
                                      {ativo.metricas.beta.toFixed(3)}
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label" title="Perda máxima esperada com 95% de confiança">VaR 95%:</span>
                                    <span className="metrica-valor">
                                      {(ativo.metricas.var_95 * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="metrica-item">
                                    <span className="metrica-label" title="Perda média nos piores 5% dos cenários">CVaR 95%:</span>
                                    <span className="metrica-valor">
                                      {(ativo.metricas.cvar_95 * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  {ativo.score_quantitativo && (
                                    <div className="metrica-item">
                                      <span className="metrica-label">Score:</span>
                                      <span className="metrica-valor">
                                        {ativo.score_quantitativo.toFixed(3)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="metricas-nao-disponiveis">Não disponíveis</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Relatório de Backtest */}
            {relatorioBacktest && (
              <div className="relatorio-backtest">
                <h4>Relatório de Backtest</h4>
                
                {relatorioBacktest.metricas_consolidadas && (
                  <div className="metricas-consolidadas">
                    <h5>Métricas Consolidadas da Carteira</h5>
                    <div className="metricas-grid">
                      <div className="metrica-card">
                        <span className="metrica-titulo">Retorno Anualizado</span>
                        <span className={`metrica-valor ${relatorioBacktest.metricas_consolidadas.retorno_anualizado > 0 ? 'positivo' : 'negativo'}`}>
                          {(relatorioBacktest.metricas_consolidadas.retorno_anualizado * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-titulo">Volatilidade</span>
                        <span className="metrica-valor">
                          {(relatorioBacktest.metricas_consolidadas.volatilidade_anualizada * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-titulo">Sharpe Ratio</span>
                        <span className={`metrica-valor ${relatorioBacktest.metricas_consolidadas.sharpe_ratio > 0.5 ? 'positivo' : 'negativo'}`}>
                          {relatorioBacktest.metricas_consolidadas.sharpe_ratio.toFixed(3)}
                        </span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-titulo">Máximo Drawdown</span>
                        <span className="metrica-valor">
                          {(relatorioBacktest.metricas_consolidadas.max_drawdown * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {relatorioBacktest.backtest && (
                  <div className="resultados-backtest">
                    <h5>Resultados do Backtest</h5>
                    <div className="backtest-info">
                      <p><strong>Período:</strong> {relatorioBacktest.periodo_backtest.data_inicio} a {relatorioBacktest.periodo_backtest.data_fim}</p>
                      <p><strong>Retorno Total:</strong> {(relatorioBacktest.backtest.metricas_backtest.retorno_total * 100).toFixed(2)}%</p>
                      <p><strong>Valor Final:</strong> R$ {relatorioBacktest.backtest.metricas_backtest.valor_final.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Metodologia e Justificativas */}
            {carteiraGerada.explicacoes_metodologia && (
              <div className="metodologia-section">
                <h4>
                  <FontAwesomeIcon icon={faLightbulb} className="section-icon" />
                  Metodologia e Justificativas
                </h4>
                
                {/* Metodologia Geral */}
                {carteiraGerada.explicacoes_metodologia.metodologia_geral && (
                  <div className="metodologia-geral">
                    <h5>
                      <FontAwesomeIcon icon={faClipboardList} className="subsection-icon" />
                      {carteiraGerada.explicacoes_metodologia.metodologia_geral.titulo}
                    </h5>
                    <ol className="passos-metodologia">
                      {carteiraGerada.explicacoes_metodologia.metodologia_geral.passos?.map((passo, index) => (
                        <li key={index}>{passo}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Perfil Ponderado */}
                {carteiraGerada.explicacoes_metodologia.perfil_ponderado && (
                  <div className="perfil-ponderado-explicacao">
                    <h5>
                      <FontAwesomeIcon icon={faBalanceScale} className="subsection-icon" />
                      {carteiraGerada.explicacoes_metodologia.perfil_ponderado.titulo}
                    </h5>
                    <div className="explicacao-texto">
                      {carteiraGerada.explicacoes_metodologia.perfil_ponderado.explicacao?.split('\n').map((linha, index) => (
                        <p key={index}>{linha.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Otimização de Alocação */}
                {carteiraGerada.explicacoes_metodologia.otimizacao_alocacao && (
                  <div className="otimizacao-explicacao">
                    <h5>
                      <FontAwesomeIcon icon={faCalculator} className="subsection-icon" />
                      {carteiraGerada.explicacoes_metodologia.otimizacao_alocacao.titulo}
                    </h5>
                    <div className="explicacao-texto">
                      {carteiraGerada.explicacoes_metodologia.otimizacao_alocacao.explicacao?.split('\n').map((linha, index) => (
                        <p key={index}>{linha.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seleção Quantitativa */}
                {carteiraGerada.explicacoes_metodologia.selecao_quantitativa && (
                  <div className="selecao-quantitativa-explicacao">
                    <h5>
                      <FontAwesomeIcon icon={faBullseye} className="subsection-icon" />
                      {carteiraGerada.explicacoes_metodologia.selecao_quantitativa.titulo}
                    </h5>
                    <div className="explicacao-texto">
                      {carteiraGerada.explicacoes_metodologia.selecao_quantitativa.explicacao?.split('\n').map((linha, index) => (
                        <p key={index}>{linha.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Justificativas por Ativo */}
                {carteiraGerada.explicacoes_metodologia.justificativas_ativos && (
                  <div className="justificativas-ativos">
                    <h5>
                      <FontAwesomeIcon icon={faAward} className="subsection-icon" />
                      Justificativas de Escolha por Ativo
                    </h5>
                    {carteiraGerada.explicacoes_metodologia.justificativas_ativos.map((justificativa, index) => (
                      <div key={index} className="justificativa-item">
                        <div className="justificativa-header">
                          <h6>{justificativa.ativo_nome}</h6>
                          <span className={`tipo-ativo ${justificativa.tipo_ativo?.includes('Direto') ? 'ativo-direto' : 'ativo-especifico'}`}>
                            {justificativa.tipo_ativo}
                          </span>
                        </div>
                        
                        <div className="justificativa-detalhes">
                          <div className="detalhes-grid">
                            <div className="detalhe-item">
                              <span className="detalhe-label">Classe:</span>
                              <span className="detalhe-valor">{justificativa.classe_ativo}</span>
                            </div>
                            <div className="detalhe-item">
                              <span className="detalhe-label">Alocação Final:</span>
                              <span className="detalhe-valor">{justificativa.alocacao_final}%</span>
                            </div>
                            {justificativa.detalhes?.alocacao_base !== 'N/A' && (
                              <>
                                <div className="detalhe-item">
                                  <span className="detalhe-label">Alocação Base:</span>
                                  <span className="detalhe-valor">{justificativa.detalhes.alocacao_base}%</span>
                                </div>
                                <div className="detalhe-item">
                                  <span className="detalhe-label">Nota Qualitativa:</span>
                                  <span className={`detalhe-valor nota-${justificativa.detalhes.nota_qualitativa}`}>
                                    {formatarNotaQualitativa(justificativa.detalhes.nota_qualitativa)}
                                  </span>
                                </div>
                                <div className="detalhe-item">
                                  <span className="detalhe-label">Ajuste por Nota:</span>
                                  <span className="detalhe-valor">{justificativa.detalhes.ajuste_nota}</span>
                                </div>
                                <div className="detalhe-item">
                                  <span className="detalhe-label">Alocação Ajustada:</span>
                                  <span className="detalhe-valor">{justificativa.detalhes.alocacao_ajustada}%</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {justificativa.detalhes?.alocacao_base !== 'N/A' && (
                            <div className="bandas-recomendadas">
                              <span className="bandas-label">Bandas Recomendadas:</span>
                              <div className="bandas-valores">
                                <span>Inferior: {justificativa.detalhes.bandas_recomendadas?.inferior}%</span>
                                <span>Neutra: {justificativa.detalhes.bandas_recomendadas?.neutra}%</span>
                                <span>Superior: {justificativa.detalhes.bandas_recomendadas?.superior}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="justificativa-texto">
                          {justificativa.justificativa_escolha?.split('\n').map((linha, index) => (
                            <p key={index}>{linha.trim()}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {carteiraGerada.observacoes && (
              <div className="observacoes">
                <h4>
                  <FontAwesomeIcon icon={faInfoCircle} className="section-icon" />
                  Observações
                </h4>
                <p>{carteiraGerada.observacoes}</p>
              </div>
            )}
            
            <div className="form-actions">
              <button
                className={`btn-export ${isDarkMode ? 'dark-mode' : ''}`}
                onClick={handleExportarRelatorio}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} />
                    Exportar PDF da Carteira
                  </>
                )}
              </button>
            </div>
          </CustomCard>
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

export default CarteiraCliente; 