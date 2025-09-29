import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faDatabase,
  faDownload,
  faFileExcel,
  faFileCsv,
  faPlus,
  faTimes,
  faCog,
  faEye,
  faTable,
  faCalculator,
  faChartBar,
  faChartArea,
  faChartPie,
  faFilter,
  faSearch,
  faPalette,
  faExpand,
  faCompress,
  faPlay,
  faRefresh,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useLoading } from '../context/LoadingContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
// Você pode usar Chart.js, Recharts ou outro pacote de gráficos
import { Line, Scatter, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import type { ChartOptions } from 'chart.js';
import * as XLSX from 'xlsx';
import './VisualizacaoDados.css';

interface SerieAtivo {
  data: string;
  valor: number;
}

interface GraficoConfig {
  tipo: 'linha' | 'barra' | 'dispersao';
  escala: 'linear';
  intervaloDias: number;
  dataInicial: string;
  dataFinal: string;
  mostrarLegenda: boolean;
  mostrarGrid: boolean;
  animacoes: boolean;
  stepX: number | undefined;
  stepY: number | undefined;
  cores: Record<string, string>;
  espessuraLinha: number;
  suavizacao: boolean;
  marcadores: 'none' | 'point' | 'line' | 'both';
  larguraGrafico: number;
  alturaGrafico: number;
  mostrarRetornoAcumulado: boolean;
  tipoRetornoDispersao?: 'periodo'; // Mantendo apenas retorno no período
}

const VisualizacaoDados: React.FC = () => {
  const { user } = useUser();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();
  const { showLoading, hideLoading } = useLoading();

  const [ativosDisponiveis, setAtivosDisponiveis] = useState<string[]>([]);
  const [ativosSelecionados, setAtivosSelecionados] = useState<string[]>([]);
  const [inputAtivo, setInputAtivo] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [series, setSeries] = useState<Record<string, SerieAtivo[]>>({});
  const [correlacao, setCorrelacao] = useState<any>(null);
  const [covariancia, setCovariancia] = useState<any>(null);
  const [retorno, setRetorno] = useState<any>(null);
  const [risco, setRisco] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });
  const [showToast, setShowToast] = useState<boolean>(false);

  // Configurações do gráfico
  const [configGrafico, setConfigGrafico] = useState<GraficoConfig>({
    tipo: 'linha',
    escala: 'linear',
    intervaloDias: 365,
    dataInicial: '',
    dataFinal: '',
    mostrarLegenda: true,
    mostrarGrid: true,
    animacoes: true,
    stepX: undefined,
    stepY: undefined,
    cores: {},
    espessuraLinha: 2,
    suavizacao: true,
    marcadores: 'point',
    larguraGrafico: 1100,
    alturaGrafico: 500,
    mostrarRetornoAcumulado: false,
    tipoRetornoDispersao: 'periodo',
  });

  // Estado para carteira eficiente
  const [loadingCarteiraEficiente, setLoadingCarteiraEficiente] = useState(false);
  const [resultadoCarteiraEficiente, setResultadoCarteiraEficiente] = useState<any>(null);
  const [backtestCarteira, setBacktestCarteira] = useState<any>(null);

  // Buscar lista de ativos disponíveis ao montar
  useEffect(() => {
    const fetchAtivos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dados-cmd/ativos', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true
        });
        setAtivosDisponiveis(response.data.ativos || []);
      } catch (error) {
        setToast({ message: 'Erro ao buscar ativos disponíveis', type: 'error' });
        setShowToast(true);
      }
    };
    fetchAtivos();
  }, []);

  // Buscar séries históricas e correlação/covariância ao mudar ativos selecionados
  useEffect(() => {
    if (ativosSelecionados.length === 0) {
      setSeries({});
      setCorrelacao(null);
      setCovariancia(null);
      setRetorno(null);
      setRisco(null);
      return;
    }
    const fetchSeries = async () => {
      try {
        showLoading('Buscando séries históricas...');
        const response = await axios.post('http://localhost:5000/api/dados-cmd/series', {
          ativos: ativosSelecionados
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true
        });
        setSeries(response.data.series || {});
      } catch (error) {
        setToast({ message: 'Erro ao buscar séries históricas', type: 'error' });
        setShowToast(true);
      } finally {
        hideLoading();
      }
    };
    fetchSeries();
    if (ativosSelecionados.length > 1) {
      const fetchCorrel = async () => {
        try {
          showLoading('Calculando correlação/covariância...');
          const response = await axios.post('http://localhost:5000/api/dados-cmd/correlacao-covariancia', {
            ativos: ativosSelecionados
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true
          });
          setCorrelacao(response.data.correlacao);
          setCovariancia(response.data.covariancia);
          setRetorno(response.data.retorno);
          setRisco(response.data.risco);
        } catch (error) {
          setToast({ message: 'Erro ao calcular correlação/covariância', type: 'error' });
          setShowToast(true);
        } finally {
          hideLoading();
        }
      };
      fetchCorrel();
    }
  }, [ativosSelecionados]);

  // Fechar dropdown ao clicar fora e gerenciar posição
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificar se o clique foi no dropdown ou no input
      const target = event.target as Element;
      const isDropdownClick = target.closest('.autocomplete-dropdown');
      const isInputClick = autocompleteRef.current?.contains(target);
      
      console.log('Click outside check:', { isDropdownClick, isInputClick, target: target.className });
      
      if (!isDropdownClick && !isInputClick) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    const handleResize = () => {
      if (showDropdown) {
        updateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showDropdown) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showDropdown]);

  // Filtrar ativos disponíveis baseado no input
  const ativosFiltrados = ativosDisponiveis.filter(ativo =>
    ativo.toLowerCase().includes(inputAtivo.toLowerCase()) &&
    !ativosSelecionados.includes(ativo)
  );

  // Adicionar ativo selecionado
  const handleAdicionarAtivo = (ativo?: string) => {
    const ativoParaAdicionar = ativo || inputAtivo;
    if (!ativoParaAdicionar || ativosSelecionados.includes(ativoParaAdicionar)) return;
    setAtivosSelecionados([...ativosSelecionados, ativoParaAdicionar]);
    setInputAtivo('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Calcular posição do dropdown
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Gerenciar input do usuário
  const handleInputChange = (value: string) => {
    setInputAtivo(value);
    if (value.length > 0) {
      updateDropdownPosition();
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
    setSelectedIndex(-1);
  };

  // Navegar com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < ativosFiltrados.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && ativosFiltrados[selectedIndex]) {
          handleAdicionarAtivo(ativosFiltrados[selectedIndex]);
        } else if (inputAtivo) {
          handleAdicionarAtivo();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Selecionar ativo do dropdown
  const handleSelectAtivo = (ativo: string) => {
    console.log('Selecionando ativo:', ativo); // Debug
    if (ativo && !ativosSelecionados.includes(ativo)) {
      setAtivosSelecionados(prev => [...prev, ativo]);
      setInputAtivo('');
      setSelectedIndex(-1);
      
      // Mostrar toast de confirmação
      setToast({ message: `Ativo ${ativo} adicionado com sucesso!`, type: 'success' });
      setShowToast(true);
      
      // Fechar dropdown com pequeno delay para garantir que o clique seja processado
      setTimeout(() => {
        setShowDropdown(false);
      }, 100);
    }
  };

  // Remover ativo
  const handleRemoverAtivo = (ativo: string) => {
    setAtivosSelecionados(ativosSelecionados.filter(a => a !== ativo));
  };

  // Filtrar dados por intervalo de datas
  const filtrarDadosPorIntervalo = (dados: SerieAtivo[]) => {
    // Ordenar sempre por data crescente
    const ordenarPorData = (arr: SerieAtivo[]) =>
      [...arr].sort((a, b) => {
        const da = new Date(a.data.split('/').reverse().join('-'));
        const db = new Date(b.data.split('/').reverse().join('-'));
        return da.getTime() - db.getTime();
      });

    if (!configGrafico.dataInicial && !configGrafico.dataFinal) {
      return ordenarPorData(dados);
    }

    return ordenarPorData(
      dados.filter(item => {
        const dataItem = new Date(item.data.split('/').reverse().join('-'));
        const dataInicial = configGrafico.dataInicial ? new Date(configGrafico.dataInicial) : null;
        const dataFinal = configGrafico.dataFinal ? new Date(configGrafico.dataFinal) : null;
        if (dataInicial && dataFinal) {
          return dataItem >= dataInicial && dataItem <= dataFinal;
        } else if (dataInicial) {
          return dataItem >= dataInicial;
        } else if (dataFinal) {
          return dataItem <= dataFinal;
        }
        return true;
      })
    );
  };

  // Função para converter dados para CSV
  const converterParaCSV = (dados: any[], nomeArquivo: string) => {
    if (!dados || dados.length === 0) {
      setToast({ message: 'Nenhum dado disponível para exportar', type: 'error' });
      setShowToast(true);
      return;
    }

    // Obter cabeçalhos
    const headers = Object.keys(dados[0]);
    
    // Criar linhas CSV
    const csvContent = [
      headers.join(','),
      ...dados.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar vírgulas e aspas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToast({ message: `Arquivo ${nomeArquivo}.csv baixado com sucesso!`, type: 'success' });
    setShowToast(true);
  };

  // Função para exportar para Excel (.xlsx) de forma assíncrona e com loading
  const exportarParaExcel = (dados: any[], nomeArquivo: string) => {
    if (!dados || dados.length === 0) {
      setToast({ message: 'Nenhum dado disponível para exportar', type: 'error' });
      setShowToast(true);
      return;
    }
    showLoading('Gerando arquivo Excel...');
    setTimeout(() => {
      try {
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dados');
        // Feedback visual: aguardar um pouco para garantir que o loading apareça
        setTimeout(() => {
          XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
          setToast({ message: `Arquivo ${nomeArquivo}.xlsx baixado com sucesso!`, type: 'success' });
          hideLoading();
          setShowToast(true);
        }, 400);
      } catch (e) {
        setToast({ message: 'Erro ao exportar para Excel', type: 'error' });
        hideLoading();
        setShowToast(true);
      }
    }, 100);
  };

  // Exportar séries históricas
  const exportarSeriesHistoricas = () => {
    showLoading('Preparando dados para exportação...');
    setTimeout(() => {
      // O loading já foi exibido, agora processa
      if (ativosSelecionados.length === 0) {
        setToast({ message: 'Selecione pelo menos um ativo', type: 'error' });
        setShowToast(true);
        hideLoading();
        return;
      }
      const dadosExportar: any[] = [];
      const todasDatas = new Set<string>();
      ativosSelecionados.forEach(ativo => {
        const dadosFiltrados = filtrarDadosPorIntervalo(series[ativo] || []);
        dadosFiltrados.forEach(item => todasDatas.add(item.data));
      });
      const datasOrdenadas = Array.from(todasDatas).sort((a, b) => 
        new Date(a.split('/').reverse().join('-')).getTime() - 
        new Date(b.split('/').reverse().join('-')).getTime()
      );
      datasOrdenadas.forEach(data => {
        const linha: any = { Data: data };
        ativosSelecionados.forEach(ativo => {
          const dadosAtivo = filtrarDadosPorIntervalo(series[ativo] || []);
          const item = dadosAtivo.find(d => d.data === data);
          linha[ativo] = item ? item.valor : '';
        });
        dadosExportar.push(linha);
      });
      const nomeArquivo = `series_historicas_${new Date().toISOString().split('T')[0]}`;
      exportarParaExcel(dadosExportar, nomeArquivo);
    }, 0);
  };

  // Exportar matriz de correlação
  const exportarCorrelacao = () => {
    showLoading('Preparando matriz de correlação...');
    setTimeout(() => {
      if (!correlacao) {
        setToast({ message: 'Matriz de correlação não disponível', type: 'error' });
        setShowToast(true);
        hideLoading();
        return;
      }
      const dadosExportar: any[] = [];
      const header: any = { 'Ativo' : '' };
      ativosSelecionados.forEach(ativo => header[ativo] = ativo);
      dadosExportar.push(header);
      ativosSelecionados.forEach(ativo => {
        const linha: any = { 'Ativo': ativo };
        ativosSelecionados.forEach(colAtivo => {
          linha[colAtivo] = correlacao[ativo]?.[colAtivo] || '';
        });
        dadosExportar.push(linha);
      });
      const nomeArquivo = `correlacao_${new Date().toISOString().split('T')[0]}`;
      exportarParaExcel(dadosExportar, nomeArquivo);
    }, 0);
  };

  // Exportar matriz de covariância
  const exportarCovariancia = () => {
    showLoading('Preparando matriz de covariância...');
    setTimeout(() => {
      if (!covariancia) {
        setToast({ message: 'Matriz de covariância não disponível', type: 'error' });
        setShowToast(true);
        hideLoading();
        return;
      }
      const dadosExportar: any[] = [];
      const header: any = { 'Ativo' : '' };
      ativosSelecionados.forEach(ativo => header[ativo] = ativo);
      dadosExportar.push(header);
      ativosSelecionados.forEach(ativo => {
        const linha: any = { 'Ativo': ativo };
        ativosSelecionados.forEach(colAtivo => {
          linha[colAtivo] = covariancia[ativo]?.[colAtivo] || '';
        });
        dadosExportar.push(linha);
      });
      const nomeArquivo = `covariancia_${new Date().toISOString().split('T')[0]}`;
      exportarParaExcel(dadosExportar, nomeArquivo);
    }, 0);
  };

  // Exportar estatísticas (retorno e risco)
  const exportarEstatisticas = () => {
    showLoading('Preparando estatísticas...');
    setTimeout(() => {
      if (!retorno || !risco) {
        setToast({ message: 'Estatísticas não disponíveis', type: 'error' });
        setShowToast(true);
        hideLoading();
        return;
      }
      const dadosExportar = ativosSelecionados.map(ativo => ({
        'Ativo': ativo,
        'Retorno Anualizado': retorno[ativo] !== undefined && retorno[ativo] !== null ? (retorno[ativo] * 100).toFixed(2) + '%' : '',
        'Risco (Volatilidade Anualizada)': risco[ativo] !== undefined && risco[ativo] !== null ? (risco[ativo] * 100).toFixed(2) + '%' : '',
        'Retorno Total no Período': retornosTotais[ativo] !== undefined ? retornosTotais[ativo].toFixed(2) + '%' : ''
      }));
      const nomeArquivo = `estatisticas_${new Date().toISOString().split('T')[0]}`;
      exportarParaExcel(dadosExportar, nomeArquivo);
    }, 0);
  };

  // Função para calcular retorno acumulado do CDI (taxa anual diária)
  const calcularRetornoAcumuladoCDI = (dados: SerieAtivo[]) => {
    if (!dados || dados.length === 0) return [];
    let resultado = [];
    let acumulado = 1;
    for (let i = 0; i < dados.length; i++) {
      const taxaAnual = dados[i].valor; // Ex: 14.9 para 14,9% a.a.
      if (taxaAnual != null) {
        const taxaDiaria = Math.pow(1 + taxaAnual / 100, 1 / 252) - 1;
        acumulado *= (1 + taxaDiaria);
        resultado.push({ data: dados[i].data, valor: (acumulado - 1) * 100 });
      }
    }
    if (resultado.length > 0) resultado[0].valor = 0;
    return resultado;
  };

  // Função para calcular retorno acumulado de cotação (padrão)
  const calcularRetornoAcumulado = (dados: SerieAtivo[], ativoNome?: string) => {
    if (ativoNome === 'CDI') {
      return calcularRetornoAcumuladoCDI(dados);
    }
    if (!dados || dados.length === 0) return [];
    let resultado = [];
    let acumulado = 1; // base 1 para multiplicação
    for (let i = 1; i < dados.length; i++) {
      const anterior = dados[i - 1].valor;
      const atual = dados[i].valor;
      if (anterior != null && atual != null && anterior !== 0) {
        const retorno = (atual - anterior) / anterior;
        acumulado *= (1 + retorno);
        resultado.push({ data: dados[i].data, valor: (acumulado - 1) * 100 }); // em %
      }
    }
    // Adicionar o ponto inicial (0%)
    if (resultado.length > 0) {
      resultado.unshift({ data: dados[0].data, valor: 0 });
    }
    return resultado;
  };

  // Função para calcular retorno total no período
  const calcularRetornoTotal = (dados: SerieAtivo[], ativoNome?: string) => {
    if (ativoNome === 'CDI') {
      // Para CDI, usar o último valor do retorno acumulado
      const acumulado = calcularRetornoAcumuladoCDI(dados);
      if (acumulado.length > 0) {
        return acumulado[acumulado.length - 1].valor;
      }
      return 0;
    }
    if (!dados || dados.length < 2) return 0;
    const primeiro = dados[0].valor;
    const ultimo = dados[dados.length - 1].valor;
    if (primeiro && ultimo && primeiro !== 0) {
      return ((ultimo - primeiro) / primeiro) * 100;
    }
    return 0;
  };

  // Calcular retornos totais para cada ativo
  const retornosTotais = ativosSelecionados.reduce((acc, ativo) => {
    if (series[ativo]) {
      const dadosFiltrados = filtrarDadosPorIntervalo(series[ativo]);
      acc[ativo] = calcularRetornoTotal(dadosFiltrados, ativo);
    }
    return acc;
  }, {} as Record<string, number>);

  // Calcular datas mais antigas e mais recentes para cada ativo
  const datasAtivos = ativosSelecionados.reduce((acc, ativo) => {
    if (series[ativo] && series[ativo].length > 0) {
      const dadosFiltrados = filtrarDadosPorIntervalo(series[ativo]);
      if (dadosFiltrados.length > 0) {
        // Ordenar por data
        const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
          const da = new Date(a.data.split('/').reverse().join('-'));
          const db = new Date(b.data.split('/').reverse().join('-'));
          return da.getTime() - db.getTime();
        });
        
        acc[ativo] = {
          dataMaisAntiga: dadosOrdenados[0].data,
          dataMaisRecente: dadosOrdenados[dadosOrdenados.length - 1].data,
          totalDados: dadosOrdenados.length
        };
      }
    }
    return acc;
  }, {} as Record<string, { dataMaisAntiga: string; dataMaisRecente: string; totalDados: number }>);

  // Preparar dados para gráfico de linha
  const lineChartData = {
    labels: series[ativosSelecionados[0]] ? 
      (configGrafico.mostrarRetornoAcumulado
        ? calcularRetornoAcumulado(filtrarDadosPorIntervalo(series[ativosSelecionados[0]]), ativosSelecionados[0])
        : filtrarDadosPorIntervalo(series[ativosSelecionados[0]]))
      .map(item => item.data) : [],
    datasets: ativosSelecionados.map((ativo, idx) => ({
      label: ativo,
      data: series[ativo] ? (
        configGrafico.mostrarRetornoAcumulado
          ? calcularRetornoAcumulado(filtrarDadosPorIntervalo(series[ativo]), ativo).map(item => item.valor)
          : filtrarDadosPorIntervalo(series[ativo]).map(item => item.valor)
      ) : [],
      borderColor: configGrafico.cores[ativo] || `hsl(${(idx * 60) % 360}, 70%, 50%)`,
      backgroundColor: configGrafico.tipo === 'barra' ? 
        (configGrafico.cores[ativo] ? configGrafico.cores[ativo] + '99' : `hsla(${(idx * 60) % 360}, 70%, 50%, 0.6)`) : 'transparent',
      tension: configGrafico.suavizacao ? 0.4 : 0,
      fill: false,
      borderWidth: configGrafico.espessuraLinha,
      pointRadius: configGrafico.marcadores === 'point' || configGrafico.marcadores === 'both' ? 4 : 0,
      pointStyle: 'circle',
      showLine: configGrafico.marcadores === 'line' || configGrafico.marcadores === 'both' || configGrafico.tipo !== 'linha',
    }))
  };

  // Preparar dados para gráfico de barras
  const barChartData = {
    labels: series[ativosSelecionados[0]] ? 
      filtrarDadosPorIntervalo(series[ativosSelecionados[0]]).map(item => item.data) : [],
    datasets: ativosSelecionados.map((ativo, idx) => ({
      label: ativo,
      data: series[ativo] ? 
        filtrarDadosPorIntervalo(series[ativo]).map(item => item.valor) : [],
      backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.6)`,
      borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
      borderWidth: 1
    }))
  };

  // Preparar dados para gráfico de dispersão (Retorno x Risco)
  const scatterData = {
    datasets: ativosSelecionados.map((ativo, idx) => {
      // Usar apenas o retorno total no período
      const yValue = retornosTotais[ativo];
      return {
        label: ativo,
        data: (risco && yValue !== undefined && yValue !== null)
          ? [{ 
              // Multiplicamos por 100 para converter para percentual
              x: risco[ativo] !== undefined && risco[ativo] !== null ? risco[ativo] * 100 : null, 
              y: yValue 
            }] : [],
        backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        pointRadius: 8
      };
    })
  };

  // Configurações comuns do gráfico para cada tipo
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: configGrafico.mostrarLegenda,
        position: 'top',
        labels: {
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          stepSize: configGrafico.stepX,
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        type: 'linear',
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: configGrafico.stepY,
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: configGrafico.animacoes ? 1000 : 0
    }
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: configGrafico.mostrarLegenda,
        position: 'top',
        labels: {
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          stepSize: configGrafico.stepX,
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        type: 'linear',
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: configGrafico.stepY,
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: configGrafico.animacoes ? 1000 : 0
    }
  };

  const scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    plugins: {
      legend: {
        display: configGrafico.mostrarLegenda,
        position: 'top',
        labels: {
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Risco (Volatilidade Anualizada)',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        },
        // stepSize não faz sentido para scatter X
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Retorno no Período',
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        type: 'linear',
        grid: {
          display: configGrafico.mostrarGrid,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          color: isDarkMode ? '#ffffff' : '#333333',
          font: {
            size: 11
          }
        },
        // stepSize não faz sentido para scatter Y
      }
    },
    animation: {
      duration: configGrafico.animacoes ? 1000 : 0
    }
  };

  // Renderizar gráfico baseado no tipo selecionado
  const renderGrafico = () => {
    const width = configGrafico.larguraGrafico;
    const height = configGrafico.alturaGrafico;
    switch (configGrafico.tipo) {
      case 'linha':
        return <Line data={lineChartData} options={lineChartOptions} width={width} height={height} />;
      case 'barra':
        return <Bar data={barChartData} options={barChartOptions} width={width} height={height} />;
      case 'dispersao':
        return <Scatter data={scatterData} options={scatterChartOptions} width={width} height={height} />;
      default:
        return <Line data={lineChartData} options={lineChartOptions} width={width} height={height} />;
    }
  };

  // Função para gerar carteira eficiente
  const handleGerarCarteiraEficiente = async () => {
    setLoadingCarteiraEficiente(true);
    setResultadoCarteiraEficiente(null);
    setBacktestCarteira(null);
    showLoading('Calculando carteira eficiente de Markowitz...');
    try {
      // Montar payload com ativos, séries históricas e período
      const payload = {
        ativos: ativosSelecionados,
        series: ativosSelecionados.reduce((acc, ativo) => {
          acc[ativo] = filtrarDadosPorIntervalo(series[ativo] || []);
          return acc;
        }, {} as Record<string, SerieAtivo[]>),
        dataInicial: configGrafico.dataInicial,
        dataFinal: configGrafico.dataFinal
      };
      // Chamar endpoint backend (ajuste a URL conforme implementação)
      const response = await axios.post('http://localhost:5000/api/markowitz/eficiente', payload, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true
      });
      setResultadoCarteiraEficiente(response.data.resultado);
      setBacktestCarteira(response.data.backtest);
      setToast({ message: 'Carteira eficiente gerada com sucesso!', type: 'success' });
      setShowToast(true);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Erro ao gerar carteira eficiente', type: 'error' });
      setShowToast(true);
    } finally {
      setLoadingCarteiraEficiente(false);
      hideLoading();
    }
  };

  return (
    <div 
      className={`visualizacao-dados-page ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="content-container">
        <div className="main-content">
          <CustomCard className="visualizacao-header-card" isDarkMode={isDarkMode}>
            <div className="visualizacao-header-modern">
              <h1>
                <FontAwesomeIcon icon={faChartLine} className="header-icon" />
                Visualização de Dados
              </h1>
              <p>Analise séries históricas, correlações e riscos dos ativos</p>
            </div>
          </CustomCard>
          <CustomCard className="ativos-selector-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <h3>
                <FontAwesomeIcon icon={faDatabase} className="card-icon" />
                Seleção de Ativos
              </h3>
              <p>Escolha os ativos para análise</p>
            </div>
            <div className="ativos-selector">
              <div className="selector-label">
                <FontAwesomeIcon icon={faSearch} className="label-icon" />
                <label>Adicionar Ativo:</label>
              </div>
              <div className="autocomplete-container" ref={autocompleteRef}>
                <div className="autocomplete-bar">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputAtivo}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (inputAtivo) {
                        updateDropdownPosition();
                        setShowDropdown(true);
                      }
                    }}
                    placeholder="Digite o código do ativo (ex: PETR4)"
                    className="custom-input"
                    autoComplete="off"
                  />
                  <CustomButton onClick={() => handleAdicionarAtivo()} className="btn-primary" isDarkMode={isDarkMode}>
                    <FontAwesomeIcon icon={faPlus} />
                    Adicionar
                  </CustomButton>
                </div>
              </div>
              <div className="ativos-selecionados-list">
                {ativosSelecionados.map(ativo => (
                  <div key={ativo} className="ativo-card">
                    <div className="ativo-header">
                      <FontAwesomeIcon icon={faChartBar} className="badge-icon" />
                      <span className="ativo-nome">{ativo}</span>
                      <button className="remove-btn" onClick={() => handleRemoverAtivo(ativo)}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    {datasAtivos[ativo] && (
                      <div className="ativo-info">
                        <div className="info-item">
                          <FontAwesomeIcon icon={faCalendarAlt} className="info-icon" />
                          <span className="info-label">Início:</span>
                          <span className="info-value">{datasAtivos[ativo].dataMaisAntiga}</span>
                        </div>
                        <div className="info-item">
                          <FontAwesomeIcon icon={faCalendarAlt} className="info-icon" />
                          <span className="info-label">Fim:</span>
                          <span className="info-value">{datasAtivos[ativo].dataMaisRecente}</span>
                        </div>
                        <div className="info-item">
                          <FontAwesomeIcon icon={faDatabase} className="info-icon" />
                          <span className="info-label">Total:</span>
                          <span className="info-value">{datasAtivos[ativo].totalDados} registros</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CustomCard>

          {/* Botão de gerar carteira eficiente de Markowitz */}
          {ativosSelecionados.length >= 2 && (
            <CustomCard className="carteira-eficiente-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faCalculator} className="card-icon" />
                  Carteira Eficiente
                </h3>
                <p>Otimização de Markowitz baseada em retorno e risco</p>
              </div>
              <CustomButton
                onClick={handleGerarCarteiraEficiente}
                className="btn-primary carteira-btn"
                isDarkMode={isDarkMode}
                disabled={loadingCarteiraEficiente}
              >
                <FontAwesomeIcon icon={loadingCarteiraEficiente ? faRefresh : faPlay} className={loadingCarteiraEficiente ? 'fa-spin' : ''} />
                {loadingCarteiraEficiente ? 'Calculando...' : 'Gerar Carteira Eficiente'}
              </CustomButton>
            </CustomCard>
          )}

          {/* Resultado da carteira eficiente */}
          {resultadoCarteiraEficiente && (
            <CustomCard className="carteira-resultado-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faChartPie} className="card-icon" />
                  Carteira Eficiente (Markowitz)
                </h3>
                <p>Resultado da otimização de portfólio</p>
              </div>
              <div className="carteira-resultado-grid">
                <div className="alocacao-section">
                  <h4>
                    <FontAwesomeIcon icon={faChartPie} className="section-icon" />
                    Alocação Ótima
                  </h4>
                  <div className="alocacao-list">
                    {Object.entries(resultadoCarteiraEficiente.alocacao || {}).map(([ativo, pct]: any) => (
                      <div key={ativo} className="alocacao-item">
                        <span className="ativo-nome">{ativo}:</span>
                        <span className="ativo-percentual">{Number(pct * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="indicadores-section">
                  <h4>
                    <FontAwesomeIcon icon={faCalculator} className="section-icon" />
                    Indicadores
                  </h4>
                  <div className="indicadores-list">
                    <div className="indicador-item">
                      <span className="indicador-label">Retorno Esperado:</span>
                      <span className="indicador-valor">{resultadoCarteiraEficiente.retorno ? (resultadoCarteiraEficiente.retorno * 100).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                    <div className="indicador-item">
                      <span className="indicador-label">Risco (Vol):</span>
                      <span className="indicador-valor">{resultadoCarteiraEficiente.risco ? (resultadoCarteiraEficiente.risco * 100).toFixed(2) + '%' : 'N/D'}</span>
                    </div>
                    <div className="indicador-item">
                      <span className="indicador-label">Sharpe:</span>
                      <span className="indicador-valor">{resultadoCarteiraEficiente.sharpe ? resultadoCarteiraEficiente.sharpe.toFixed(2) : 'N/D'}</span>
                    </div>
                  </div>
                </div>
                {resultadoCarteiraEficiente.parecer && (
                  <div className="parecer-section">
                    <h4>
                      <FontAwesomeIcon icon={faEye} className="section-icon" />
                      Parecer
                    </h4>
                    <div className="parecer-content">{resultadoCarteiraEficiente.parecer}</div>
                  </div>
                )}
              </div>
            </CustomCard>
          )}

          {/* Gráfico de backtest da carteira eficiente */}
          {backtestCarteira && backtestCarteira.series && (
            <CustomCard className="backtest-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faChartArea} className="card-icon" />
                  Backtest da Carteira Eficiente
                </h3>
                <p>Evolução histórica da carteira otimizada</p>
              </div>
              <div className="backtest-chart">
                <Line
                  data={{
                    labels: backtestCarteira.series.map((p: any) => p.data),
                    datasets: [
                      {
                        label: 'Carteira Eficiente',
                        data: backtestCarteira.series.map((p: any) => p.valor),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.2)',
                        tension: 0.2,
                        borderWidth: 3,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: { 
                      legend: { 
                        display: true, 
                        position: 'top',
                        labels: {
                          color: isDarkMode ? '#ffffff' : '#333333',
                          font: {
                            size: 12,
                            weight: 'normal'
                          }
                        }
                      } 
                    },
                    scales: {
                      x: { 
                        title: { 
                          display: true, 
                          text: 'Data',
                          color: isDarkMode ? '#ffffff' : '#333333',
                          font: {
                            size: 13,
                            weight: 'bold'
                          }
                        },
                        grid: {
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: isDarkMode ? '#ffffff' : '#333333',
                          font: {
                            size: 11
                          }
                        }
                      },
                      y: { 
                        title: { 
                          display: true, 
                          text: 'Retorno Acumulado (%)',
                          color: isDarkMode ? '#ffffff' : '#333333',
                          font: {
                            size: 13,
                            weight: 'bold'
                          }
                        },
                        grid: {
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: isDarkMode ? '#ffffff' : '#333333',
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                  width={900}
                  height={350}
                />
              </div>
              <div className="backtest-summary">
                <div className="summary-item">
                  <FontAwesomeIcon icon={faCalculator} className="summary-icon" />
                  <span className="summary-label">Retorno Total no Período:</span>
                  <span className="summary-value">{backtestCarteira.retornoTotal !== undefined ? backtestCarteira.retornoTotal.toFixed(2) + '%' : 'N/D'}</span>
                </div>
              </div>
            </CustomCard>
          )}

          {ativosSelecionados.length > 0 && (
            <CustomCard className="graficos-section-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon={faChartLine} className="card-icon" />
                  Visualização de Dados
                </h3>
                <p>Configure e visualize gráficos dos ativos selecionados</p>
              </div>
              {/* Controles do gráfico */}
              <div className="controles-grafico">
                <div className="controles-header">
                  <h4>
                    <FontAwesomeIcon icon={faCog} className="section-icon" />
                    Configurações do Gráfico
                  </h4>
                </div>
                <div className="controles-grid">
                  {/* Tamanho do gráfico */}
                  <div className="controle-grupo">
                    <label>
                      <FontAwesomeIcon icon={faExpand} className="label-icon" />
                      Largura do Gráfico (px):
                    </label>
                    <input
                      type="number"
                      min={400}
                      max={3000}
                      value={configGrafico.larguraGrafico}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        larguraGrafico: Number(e.target.value)
                      })}
                      className="controle-input"
                    />
                  </div>
                  <div className="controle-grupo">
                    <label>
                      <FontAwesomeIcon icon={faCompress} className="label-icon" />
                      Altura do Gráfico (px):
                    </label>
                    <input
                      type="number"
                      min={200}
                      max={1500}
                      value={configGrafico.alturaGrafico}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        alturaGrafico: Number(e.target.value)
                      })}
                      className="controle-input"
                    />
                  </div>
                  {/* Retorno acumulado */}
                  <div className="controle-grupo checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={configGrafico.mostrarRetornoAcumulado}
                        onChange={e => setConfigGrafico({
                          ...configGrafico,
                          mostrarRetornoAcumulado: e.target.checked
                        })}
                      />
                      <FontAwesomeIcon icon={faCalculator} className="label-icon" />
                      Mostrar Retorno Acumulado
                    </label>
                  </div>
                  <div className="controle-grupo">
                    <label>
                      <FontAwesomeIcon icon={faChartBar} className="label-icon" />
                      Tipo de Gráfico:
                    </label>
                    <select 
                      value={configGrafico.tipo}
                      onChange={(e) => setConfigGrafico({
                        ...configGrafico,
                        tipo: e.target.value as 'linha' | 'barra' | 'dispersao'
                      })}
                      className="controle-select"
                    >
                      <option value="linha">Linha</option>
                      <option value="barra">Barras</option>
                      <option value="dispersao">Dispersão (Retorno x Risco)</option>
                    </select>
                  </div>
                  {/* Suavização da curva */}
                  <div className="controle-grupo">
                    <label>
                      <FontAwesomeIcon icon={faPalette} className="label-icon" />
                      Suavização da Curva:
                    </label>
                    <select
                      value={configGrafico.suavizacao ? 'sim' : 'nao'}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        suavizacao: e.target.value === 'sim'
                      })}
                      className="controle-select"
                    >
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>
                  {/* Marcadores */}
                  <div className="controle-grupo">
                    <label>
                      <FontAwesomeIcon icon={faFilter} className="label-icon" />
                      Marcadores:
                    </label>
                    <select
                      value={configGrafico.marcadores}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        marcadores: e.target.value as 'none' | 'point' | 'line' | 'both'
                      })}
                      className="controle-select"
                    >
                      <option value="none">Nenhum</option>
                      <option value="point">Ponto</option>
                      <option value="line">Linha</option>
                      <option value="both">Ambos</option>
                    </select>
                  </div>

                  {/* Step dos eixos */}
                  <div className="controle-grupo">
                    <label>Step Eixo X (datas):</label>
                    <input
                      type="number"
                      min={1}
                      value={configGrafico.stepX || ''}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        stepX: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="controle-input"
                      placeholder="Auto"
                    />
                  </div>
                  <div className="controle-grupo">
                    <label>Step Eixo Y (valor):</label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={configGrafico.stepY || ''}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        stepY: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="controle-input"
                      placeholder="Auto"
                    />
                  </div>
                  {/* Espessura da linha */}
                  <div className="controle-grupo">
                    <label>Espessura da Linha:</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={configGrafico.espessuraLinha}
                      onChange={e => setConfigGrafico({
                        ...configGrafico,
                        espessuraLinha: Number(e.target.value)
                      })}
                      className="controle-input"
                    />
                  </div>
                  {/* Cores dos ativos */}
                  {ativosSelecionados.map((ativo, idx) => (
                    <div className="controle-grupo" key={ativo}>
                      <label>Cor do {ativo}:</label>
                      <input
                        type="color"
                        value={configGrafico.cores[ativo] || `#${((1 << 24) + (Math.floor((idx * 60) % 360) * 65793)).toString(16).slice(1, 7)}`}
                        onChange={e => setConfigGrafico({
                          ...configGrafico,
                          cores: { ...configGrafico.cores, [ativo]: e.target.value }
                        })}
                        className="controle-input"
                        style={{ width: 40, height: 32, padding: 0 }}
                      />
                    </div>
                  ))}

                  <div className="controle-grupo">
                    <label>Data Inicial:</label>
                    <input
                      type="date"
                      value={configGrafico.dataInicial}
                      onChange={(e) => setConfigGrafico({
                        ...configGrafico,
                        dataInicial: e.target.value
                      })}
                      className="controle-input"
                    />
                  </div>

                  <div className="controle-grupo">
                    <label>Data Final:</label>
                    <input
                      type="date"
                      value={configGrafico.dataFinal}
                      onChange={(e) => setConfigGrafico({
                        ...configGrafico,
                        dataFinal: e.target.value
                      })}
                      className="controle-input"
                    />
                  </div>

                  <div className="controle-grupo">
                    <label>
                      <input
                        type="checkbox"
                        checked={configGrafico.mostrarLegenda}
                        onChange={(e) => setConfigGrafico({
                          ...configGrafico,
                          mostrarLegenda: e.target.checked
                        })}
                      />
                      Mostrar Legenda
                    </label>
                  </div>

                  <div className="controle-grupo">
                    <label>
                      <input
                        type="checkbox"
                        checked={configGrafico.mostrarGrid}
                        onChange={(e) => setConfigGrafico({
                          ...configGrafico,
                          mostrarGrid: e.target.checked
                        })}
                      />
                      Mostrar Grade
                    </label>
                  </div>

                  <div className="controle-grupo">
                    <label>
                      <input
                        type="checkbox"
                        checked={configGrafico.animacoes}
                        onChange={(e) => setConfigGrafico({
                          ...configGrafico,
                          animacoes: e.target.checked
                        })}
                      />
                      Animações
                    </label>
                  </div>
                  {/* Removida a opção de tipo de retorno, usando apenas retorno no período */}
                </div>
              </div>

              {/* Botões de Exportação */}
              <div className="exportacao-section">
                <div className="exportacao-header">
                  <h4>
                    <FontAwesomeIcon icon={faDownload} className="section-icon" />
                    Exportar Dados
                  </h4>
                  <p>Baixe os dados em formato Excel</p>
                </div>
                <div className="botoes-exportacao">
                  <CustomButton 
                    onClick={exportarSeriesHistoricas}
                    className="btn-export"
                    isDarkMode={isDarkMode}
                  >
                    <FontAwesomeIcon icon={faFileExcel} />
                    Séries Históricas
                  </CustomButton>
                  
                  {retorno && risco && (
                    <CustomButton 
                      onClick={exportarEstatisticas}
                      className="btn-export"
                      isDarkMode={isDarkMode}
                    >
                      <FontAwesomeIcon icon={faCalculator} />
                      Estatísticas
                    </CustomButton>
                  )}
                  
                  {correlacao && (
                    <CustomButton 
                      onClick={exportarCorrelacao}
                      className="btn-export"
                      isDarkMode={isDarkMode}
                    >
                      <FontAwesomeIcon icon={faTable} />
                      Correlação
                    </CustomButton>
                  )}
                  
                  {covariancia && (
                    <CustomButton 
                      onClick={exportarCovariancia}
                      className="btn-export"
                      isDarkMode={isDarkMode}
                    >
                      <FontAwesomeIcon icon={faFileExcel} />
                      Covariância
                    </CustomButton>
                  )}
                </div>
              </div>

              <div className="serie-historica-section">
                <div className="serie-header">
                  <h4>
                    <FontAwesomeIcon icon={faChartLine} className="section-icon" />
                    Série Histórica
                  </h4>
                </div>
                
                {/* Informações de retorno total */}
                {configGrafico.mostrarRetornoAcumulado && Object.keys(retornosTotais).length > 0 && (
                  <div className="retorno-total-info">
                    <div className="retorno-header">
                      <h5>
                        <FontAwesomeIcon icon={faCalculator} className="subsection-icon" />
                        Retorno Total no Período
                      </h5>
                    </div>
                    <div className="retorno-cards">
                      {ativosSelecionados.map(ativo => (
                        <div key={ativo} className="retorno-card">
                          <div className="ativo-nome">
                            <FontAwesomeIcon icon={faChartBar} className="ativo-icon" />
                            {ativo}
                          </div>
                          <div className={`retorno-valor ${retornosTotais[ativo] >= 0 ? 'positivo' : 'negativo'}`}>
                            {retornosTotais[ativo] !== undefined && retornosTotais[ativo] !== null
                              ? `${retornosTotais[ativo] >= 0 ? '+' : ''}${retornosTotais[ativo].toFixed(2)}%`
                              : 'N/D'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grafico-linha">
                  {renderGrafico()}
                </div>
              </div>

              {correlacao && (
                <div className="tabela-correlacao">
                  <div className="tabela-header">
                    <h4>
                      <FontAwesomeIcon icon={faTable} className="section-icon" />
                      Matriz de Correlação
                    </h4>
                    <p>Correlação entre os retornos dos ativos</p>
                  </div>
                  <div className="tabela-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          {ativosSelecionados.map(ativo => <th key={ativo}>{ativo}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {ativosSelecionados.map(rowAtivo => (
                          <tr key={rowAtivo}>
                            <td className="row-header">{rowAtivo}</td>
                            {ativosSelecionados.map(colAtivo => (
                              <td key={colAtivo} className="data-cell">
                                {correlacao[rowAtivo]?.[colAtivo] ? Number(correlacao[rowAtivo][colAtivo]).toFixed(3) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {covariancia && (
                <div className="tabela-covariancia">
                  <div className="tabela-header">
                    <h4>
                      <FontAwesomeIcon icon={faCalculator} className="section-icon" />
                      Matriz de Covariância
                    </h4>
                    <p>Covariância entre os retornos dos ativos</p>
                  </div>
                  <div className="tabela-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          {ativosSelecionados.map(ativo => <th key={ativo}>{ativo}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {ativosSelecionados.map(rowAtivo => (
                          <tr key={rowAtivo}>
                            <td className="row-header">{rowAtivo}</td>
                            {ativosSelecionados.map(colAtivo => (
                              <td key={colAtivo} className="data-cell">
                                {covariancia[rowAtivo]?.[colAtivo] ? Number(covariancia[rowAtivo][colAtivo]).toFixed(6) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CustomCard>
          )}
        </div>
      </div>
      {showToast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setShowToast(false)}
        />
      )}
      
      {/* Dropdown do autocomplete renderizado via portal */}
      {showDropdown && ativosFiltrados.length > 0 && createPortal(
        <div 
          className="autocomplete-dropdown"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 300)
          }}
          onClick={(e) => e.stopPropagation()} // Prevenir propagação do clique
        >
          {ativosFiltrados.slice(0, 10).map((ativo, index) => (
            <div
              key={ativo}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectAtivo(ativo);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <FontAwesomeIcon icon={faChartBar} className="item-icon" />
              <span className="item-text">{ativo}</span>
              {ativosSelecionados.includes(ativo) && (
                <span className="item-added">Já adicionado</span>
              )}
            </div>
          ))}
          {ativosFiltrados.length > 10 && (
            <div className="autocomplete-more">
              +{ativosFiltrados.length - 10} mais ativos disponíveis
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default VisualizacaoDados; 