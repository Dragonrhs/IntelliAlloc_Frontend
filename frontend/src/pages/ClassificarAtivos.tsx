import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import TextHighlight from '../components/TextHighlight';
import './ClassificarAtivos.css';
import * as XLSX from 'xlsx';

interface Ativo {
  id: number;
  nome: string;
  classe: string;
  ticker: string | null;
  isin: string | null;
  cnpj: string | null;
}

interface ClassificacaoAtivo {
  id: number;
  ativo_id: number;
  classe_investimento: string;
  indexador_primario: string;
  tipo_indexador: 'cnpj' | 'ticker' | 'isin';
  data_classificacao: string;
}

interface ErroImportacao {
  linha: number;
  mensagem: string;
}

const ClassificarAtivos: React.FC = () => {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [classificacoes, setClassificacoes] = useState<Record<number, ClassificacaoAtivo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroClasse, setFiltroClasse] = useState<string>('');
  const [filtroClasseInvestimento, setFiltroClasseInvestimento] = useState<string>('');
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [filtroClassificacao, setFiltroClassificacao] = useState<'todos' | 'classificados' | 'nao_classificados'>('todos');
  const [importando, setImportando] = useState(false);
  const [errosImportacao, setErrosImportacao] = useState<ErroImportacao[]>([]);
  const [mostrarErros, setMostrarErros] = useState(false);
  const [importacaoSucesso, setImportacaoSucesso] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { checkPermission } = useUser();
  const itensPorPagina = 10;

  const classesAtivos = [
    "Renda Fixa",
    "Fundos",
    "Prev",
    "Listados",
    "Cetipados",
    "COE",
    "Fundos Internacionais",
    "Renda Fixa Internacional"
  ];

  const classesInvestimento = [
    "Pós-Fixado",
    "Inflação",
    "Pré-Fixado",
    "Multimercado",
    "Renda Variável Brasil",
    "Fundos Listados",
    "Alternativos",
    "Renda Fixa Global",
    "Renda Variável Internacional"
  ];

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
          carregarClassificacoes(response.data.ativos);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (error: any) {
        console.error('Erro ao carregar ativos:', error);
        setError(error.response?.data?.error || 'Erro ao carregar ativos. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarAtivos();
  }, []);

  const carregarClassificacoes = async (ativos: Ativo[]) => {
    try {
      const response = await axios.get('http://localhost:5000/api/ativos/classificacoes', {
        withCredentials: true
      });
      
      if (response.data && response.data.classificacoes) {
        console.log('Classificações carregadas do servidor:', response.data.classificacoes);
        
        // Inicializa o mapa de classificações
        const classificacoesMap: Record<number, ClassificacaoAtivo> = {};
        
        // Primeiro, inicializa com valores padrão para todos os ativos
        ativos.forEach(ativo => {
          const indexadorPadrao = determinarIndexadorPadrao(ativo);
          
          // Garantir que o tipo seja válido
          let tipoIndexador: 'cnpj' | 'ticker' | 'isin' = 'cnpj';
          if (indexadorPadrao.tipo === 'ticker' || indexadorPadrao.tipo === 'isin') {
            tipoIndexador = indexadorPadrao.tipo;
          }
          
          classificacoesMap[ativo.id] = {
            id: 0, // id 0 significa que não está salvo no banco ainda
            ativo_id: ativo.id,
            classe_investimento: determinarClasseInvestimentoPadrao(ativo),
            indexador_primario: indexadorPadrao.valor,
            tipo_indexador: tipoIndexador,
            data_classificacao: new Date().toISOString()
          };
        });
        
        // Depois, substitui com as classificações existentes do banco
        response.data.classificacoes.forEach((classificacao: ClassificacaoAtivo) => {
          // Garantir que o tipo_indexador da classificação do banco seja válido
          if (classificacao.tipo_indexador !== 'cnpj' && 
              classificacao.tipo_indexador !== 'ticker' && 
              classificacao.tipo_indexador !== 'isin') {
            classificacao.tipo_indexador = 'cnpj';
          }
          
          // Garantir que o indexador_primario não seja null ou undefined
          if (classificacao.indexador_primario === null || classificacao.indexador_primario === undefined) {
            const ativo = ativos.find(a => a.id === classificacao.ativo_id);
            if (ativo) {
              const indexadorPadrao = determinarIndexadorPadrao(ativo);
              classificacao.indexador_primario = indexadorPadrao.valor;
            } else {
              classificacao.indexador_primario = '';
            }
          }
          
          classificacoesMap[classificacao.ativo_id] = classificacao;
        });
        
        console.log('Mapa de classificações após processamento:', classificacoesMap);
        setClassificacoes(classificacoesMap);
      }
    } catch (error) {
      console.error('Erro ao carregar classificações:', error);
    }
  };

  const determinarIndexadorPadrao = (ativo: Ativo): { valor: string, tipo: 'cnpj' | 'ticker' | 'isin' } => {
    // Determina qual indexador usar com base na classe do ativo
    switch (ativo.classe) {
      case 'Renda Fixa':
        return { valor: ativo.ticker || '', tipo: 'ticker' };
      case 'Fundos':
      case 'Prev':
      case 'Cetipados':
        return { valor: ativo.cnpj || '', tipo: 'cnpj' };
      case 'Listados':
        return { valor: ativo.ticker || '', tipo: 'ticker' };
      case 'COE':
      case 'Fundos Internacionais':
      case 'Renda Fixa Internacional':
        return { valor: ativo.isin || '', tipo: 'isin' };
      default:
        // Verifica qual campo não é nulo e usa como padrão
        if (ativo.cnpj) return { valor: ativo.cnpj, tipo: 'cnpj' };
        if (ativo.ticker) return { valor: ativo.ticker, tipo: 'ticker' };
        if (ativo.isin) return { valor: ativo.isin, tipo: 'isin' };
        return { valor: '', tipo: 'cnpj' };
    }
  };

  const determinarClasseInvestimentoPadrao = (ativo: Ativo): string => {
    // Sugere uma classe de investimento com base na classe do ativo
    switch (ativo.classe) {
      case 'Renda Fixa':
        return 'Pós-Fixado'; // Padrão para Renda Fixa
      case 'Fundos':
        return 'Multimercado'; // Padrão para Fundos
      case 'Prev':
        return 'Pós-Fixado'; // Padrão para Prev
      case 'Listados':
        return 'Renda Variável Brasil'; // Padrão para Listados
      case 'Cetipados':
        return 'Pós-Fixado'; // Padrão para Cetipados
      case 'COE':
        return 'Alternativos'; // Padrão para COE
      case 'Fundos Internacionais':
        return 'Renda Variável Internacional'; // Padrão para Fundos Internacionais
      case 'Renda Fixa Internacional':
        return 'Renda Fixa Global'; // Padrão para Renda Fixa Internacional
      default:
        return 'Pós-Fixado'; // Padrão genérico
    }
  };

  const handleClassificacaoChange = (
    ativoId: number, 
    campo: 'classe_investimento' | 'tipo_indexador' | 'indexador_primario', 
    valor: string
  ) => {
    setClassificacoes(prev => {
      const ativo = ativos.find(a => a.id === ativoId);
      if (!ativo) return prev;

      const indexadorPadrao = determinarIndexadorPadrao(ativo);
      
      // Obtém a classificação atual ou cria uma nova com valores padrão
      const classificacaoAtual = prev[ativoId] || {
        id: 0,
        ativo_id: ativoId,
        classe_investimento: determinarClasseInvestimentoPadrao(ativo),
        indexador_primario: indexadorPadrao.valor,
        tipo_indexador: indexadorPadrao.tipo,
        data_classificacao: new Date().toISOString()
      };
      
      // Cria uma nova classificação com os valores atuais
      const novaClassificacao = { ...classificacaoAtual };
      
      // Atualiza o campo específico com tipagem correta
      if (campo === 'tipo_indexador') {
        novaClassificacao[campo] = valor as 'cnpj' | 'ticker' | 'isin';
      } else if (campo === 'indexador_primario') {
        // Garantir que o indexador_primario não seja null ou undefined
        novaClassificacao[campo] = valor || '';
      } else {
        novaClassificacao[campo] = valor;
      }
      
      console.log(`Campo ${campo} alterado para ${valor} no ativo ${ativoId}`, novaClassificacao);
      
      return {
        ...prev,
        [ativoId]: novaClassificacao
      };
    });
  };

  const salvarClassificacao = async (ativoId: number) => {
    const classificacao = classificacoes[ativoId];
    if (!classificacao || !classificacao.classe_investimento) {
      setMensagem({
        texto: 'Por favor, selecione uma classe de investimento antes de salvar.',
        tipo: 'erro'
      });
      setTimeout(() => setMensagem(null), 3000);
      return;
    }

    // Garante que temos valores válidos para enviar
    const ativo = ativos.find(a => a.id === ativoId);
    if (!ativo) {
      setMensagem({
        texto: 'Ativo não encontrado.',
        tipo: 'erro'
      });
      setTimeout(() => setMensagem(null), 3000);
      return;
    }

    const indexadorPadrao = determinarIndexadorPadrao(ativo);
    
    // Garantir que tipo_indexador seja um dos valores válidos
    let tipoIndexador: 'cnpj' | 'ticker' | 'isin' = 'cnpj';
    if (classificacao.tipo_indexador === 'ticker' || classificacao.tipo_indexador === 'isin') {
      tipoIndexador = classificacao.tipo_indexador;
    } else if (indexadorPadrao.tipo === 'ticker' || indexadorPadrao.tipo === 'isin') {
      tipoIndexador = indexadorPadrao.tipo;
    }
    
    // Garantir que o indexador primário não seja undefined ou null
    const indexadorPrimario = classificacao.indexador_primario || indexadorPadrao.valor;
    
    const dados = {
      ativo_id: ativoId,
      classe_investimento: classificacao.classe_investimento,
      indexador_primario: indexadorPrimario,
      tipo_indexador: tipoIndexador
    };

    console.log('Dados enviados para o servidor:', dados);

    setSalvando(true);
    try {
      const endpoint = classificacao.id 
        ? `http://localhost:5000/api/ativos/classificacao/${classificacao.id}`
        : 'http://localhost:5000/api/ativos/classificacao';
      
      const method = classificacao.id ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: dados,
        withCredentials: true
      });

      if (response.data && response.data.classificacao) {
        console.log('Resposta do servidor:', response.data);
        
        // Garantir que os valores da resposta sejam usados
        const classificacaoAtualizada = {
          ...response.data.classificacao,
          indexador_primario: response.data.classificacao.indexador_primario || indexadorPrimario
        };
        
        setClassificacoes(prev => ({
          ...prev,
          [ativoId]: classificacaoAtualizada
        }));

        setMensagem({
          texto: 'Classificação salva com sucesso!',
          tipo: 'sucesso'
        });
        setTimeout(() => setMensagem(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar classificação:', error);
      setMensagem({
        texto: 'Erro ao salvar classificação. Por favor, tente novamente.',
        tipo: 'erro'
      });
      setTimeout(() => setMensagem(null), 3000);
    } finally {
      setSalvando(false);
    }
  };

  const ativosFiltrados = ativos.filter(ativo => {
    // Filtro por classe
    if (filtroClasse && ativo.classe !== filtroClasse) {
      return false;
    }

    // Filtro por status de classificação
    if (filtroClassificacao === 'classificados' && !classificacoes[ativo.id]?.id) {
      return false;
    }
    if (filtroClassificacao === 'nao_classificados' && classificacoes[ativo.id]?.id) {
      return false;
    }

    // Filtro por classe de investimento
    if (filtroClasseInvestimento && classificacoes[ativo.id]?.classe_investimento !== filtroClasseInvestimento) {
      return false;
    }

    // Filtro global
    if (buscaGlobal) {
      const termoBusca = buscaGlobal.toLowerCase();
      return (
        ativo.nome.toLowerCase().includes(termoBusca) ||
        ativo.classe.toLowerCase().includes(termoBusca) ||
        (ativo.ticker && ativo.ticker.toLowerCase().includes(termoBusca)) ||
        (ativo.isin && ativo.isin.toLowerCase().includes(termoBusca)) ||
        (ativo.cnpj && ativo.cnpj.toLowerCase().includes(termoBusca))
      );
    }

    return true;
  });

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const ativosPaginados = ativosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(ativosFiltrados.length / itensPorPagina);

  const formatarCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    try {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } catch (error) {
      console.error('Erro ao formatar CNPJ:', error);
      return cnpj;
    }
  };

  // Estatísticas de classificação
  const totalAtivos = ativos.length;
  const totalClassificados = Object.values(classificacoes).filter(c => c.id).length;
  const percentualClassificados = totalAtivos > 0 ? (totalClassificados / totalAtivos) * 100 : 0;

  // Função para validar se a classe de investimento é válida
  const validarClasseInvestimento = (classe: string): boolean => {
    return classesInvestimento.includes(classe);
  };

  // Função para encontrar um ativo pelo identificador (ticker, ISIN ou CNPJ)
  const encontrarAtivoPorIdentificador = (identificador: string): Ativo | undefined => {
    // Remover formatação do CNPJ se for o caso
    const cnpjLimpo = identificador.replace(/[^\d]/g, '');
    
    return ativos.find(ativo => 
      (ativo.ticker && ativo.ticker.toLowerCase() === identificador.toLowerCase()) ||
      (ativo.isin && ativo.isin.toLowerCase() === identificador.toLowerCase()) ||
      (ativo.cnpj && ativo.cnpj.replace(/[^\d]/g, '') === cnpjLimpo)
    );
  };

  // Função para importar classificações de um arquivo Excel
  const importarClassificacoes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImportando(true);
    setErrosImportacao([]);
    setMostrarErros(false);
    setImportacaoSucesso(false);

    try {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          if (json.length === 0) {
            setMensagem({
              texto: 'Arquivo vazio ou sem dados válidos.',
              tipo: 'erro'
            });
            setImportando(false);
            return;
          }

          // Verificar se as colunas necessárias existem
          const primeiraLinha = json[0] as any;
          if (!primeiraLinha.Identificador || !primeiraLinha['Classe de Investimento']) {
            setMensagem({
              texto: 'Formato de arquivo inválido. O arquivo deve conter as colunas "Identificador" e "Classe de Investimento".',
              tipo: 'erro'
            });
            setImportando(false);
            return;
          }

          // Validar cada linha
          const erros: ErroImportacao[] = [];
          const classificacoesValidas: {ativo_id: number, classe_investimento: string}[] = [];

          json.forEach((row: any, index) => {
            const numeroLinha = index + 2; // +2 porque a linha 1 é o cabeçalho e o índice começa em 0
            const identificador = row.Identificador?.toString() || '';
            const classeInvestimento = row['Classe de Investimento']?.toString() || '';

            // Validar se o identificador foi informado
            if (!identificador) {
              erros.push({
                linha: numeroLinha,
                mensagem: 'Identificador não informado'
              });
              return;
            }

            // Validar se a classe de investimento foi informada e é válida
            if (!classeInvestimento) {
              erros.push({
                linha: numeroLinha,
                mensagem: 'Classe de Investimento não informada'
              });
              return;
            }

            if (!validarClasseInvestimento(classeInvestimento)) {
              erros.push({
                linha: numeroLinha,
                mensagem: `Classe de Investimento "${classeInvestimento}" inválida. Valores válidos: ${classesInvestimento.join(', ')}`
              });
              return;
            }

            // Validar se o ativo existe
            const ativo = encontrarAtivoPorIdentificador(identificador);
            if (!ativo) {
              erros.push({
                linha: numeroLinha,
                mensagem: `Ativo com identificador "${identificador}" não encontrado no sistema`
              });
              return;
            }

            // Adicionar à lista de classificações válidas
            classificacoesValidas.push({
              ativo_id: ativo.id,
              classe_investimento: classeInvestimento
            });
          });

          if (erros.length > 0) {
            setErrosImportacao(erros);
            setMostrarErros(true);
            setMensagem({
              texto: `Foram encontrados ${erros.length} erros no arquivo. Verifique a lista de erros.`,
              tipo: 'erro'
            });
            setImportando(false);
            return;
          }

          // Se não houver erros, salvar as classificações
          let sucessos = 0;
          let falhas = 0;

          for (const classificacao of classificacoesValidas) {
            try {
              const ativo = ativos.find(a => a.id === classificacao.ativo_id);
              if (!ativo) continue;

              const indexadorPadrao = determinarIndexadorPadrao(ativo);
              
              // Verificar se já existe classificação para este ativo
              const classificacaoExistente = classificacoes[ativo.id];
              
              // Se não houver alteração na classe de investimento, pular
              if (classificacaoExistente?.id && 
                  classificacaoExistente.classe_investimento === classificacao.classe_investimento) {
                console.log(`Pulando ativo ${ativo.id} pois a classificação não mudou`);
                sucessos++;
                continue;
              }
              
              const endpoint = classificacaoExistente?.id 
                ? `http://localhost:5000/api/ativos/classificacao/${classificacaoExistente.id}`
                : 'http://localhost:5000/api/ativos/classificacao';
              
              const method = classificacaoExistente?.id ? 'put' : 'post';
              
              const dados = {
                ativo_id: ativo.id,
                classe_investimento: classificacao.classe_investimento,
                indexador_primario: classificacaoExistente?.indexador_primario || indexadorPadrao.valor,
                tipo_indexador: classificacaoExistente?.tipo_indexador || indexadorPadrao.tipo
              };

              await axios({
                method,
                url: endpoint,
                data: dados,
                withCredentials: true
              });

              sucessos++;
            } catch (error) {
              console.error('Erro ao salvar classificação:', error);
              falhas++;
            }
          }

          // Recarregar as classificações
          await carregarClassificacoes(ativos);

          // Mostrar confirmação visual de sucesso
          if (sucessos > 0) {
            setImportacaoSucesso(true);
            setTimeout(() => setImportacaoSucesso(false), 3000);
          }

          setMensagem({
            texto: `Importação concluída. ${sucessos} classificações importadas com sucesso. ${falhas} falhas.`,
            tipo: falhas > 0 ? 'erro' : 'sucesso'
          });
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          setMensagem({
            texto: 'Erro ao processar o arquivo. Verifique o formato e tente novamente.',
            tipo: 'erro'
          });
        } finally {
          setImportando(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao importar classificações:', error);
      setMensagem({
        texto: 'Erro ao importar classificações. Por favor, tente novamente.',
        tipo: 'erro'
      });
      setImportando(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Função para baixar o modelo de importação
  const baixarModelo = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Identificador', 'Classe de Investimento'],
      ['PETR4', 'Renda Variável Brasil'],
      ['12.345.678/0001-00', 'Multimercado'],
      ['BRPETRACNOR9', 'Renda Variável Brasil']
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
    
    XLSX.writeFile(workbook, 'modelo_importacao_classificacoes.xlsx');
  };

  if (loading) {
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
            <div className="loading">Carregando...</div>
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
          <h1>Classificar Ativos</h1>

          {error && <div className="error-message">{error}</div>}
          {mensagem && (
            <div className={`mensagem ${mensagem.tipo === 'sucesso' ? 'sucesso' : 'erro'}`}>
              {mensagem.texto}
            </div>
          )}

          <div className="estatisticas-container">
            <div className="estatistica-item">
              <span className="estatistica-label">Total de Ativos:</span>
              <span className="estatistica-valor">{totalAtivos}</span>
            </div>
            <div className="estatistica-item">
              <span className="estatistica-label">Ativos Classificados:</span>
              <span className="estatistica-valor">{totalClassificados}</span>
            </div>
            <div className="estatistica-item">
              <span className="estatistica-label">Percentual Classificado:</span>
              <span className="estatistica-valor">{percentualClassificados.toFixed(2)}%</span>
            </div>
            <div className="progresso-container">
              <div 
                className="progresso-barra" 
                style={{ width: `${percentualClassificados}%` }}
              ></div>
            </div>
          </div>

          <div className="acoes-container">
            <div className="acoes-grupo">
              <button 
                className="acao-button modelo"
                onClick={baixarModelo}
              >
                Baixar Modelo de Importação
              </button>
              <div className="importar-container">
                <input
                  type="file"
                  id="importarClassificacoes"
                  ref={fileInputRef}
                  onChange={importarClassificacoes}
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                />
                <button 
                  className={`acao-button importar ${importacaoSucesso ? 'importacao-sucesso' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importando}
                >
                  {importando ? 'Importando...' : importacaoSucesso ? '✓ Importação Concluída!' : 'Importar Classificações'}
                </button>
              </div>
            </div>
          </div>

          {mostrarErros && errosImportacao.length > 0 && (
            <div className="erros-importacao">
              <h3>Erros de Importação</h3>
              <button 
                className="fechar-erros"
                onClick={() => setMostrarErros(false)}
              >
                Fechar
              </button>
              <table className="tabela-erros">
                <thead>
                  <tr>
                    <th>Linha</th>
                    <th>Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {errosImportacao.map((erro, index) => (
                    <tr key={index}>
                      <td>{erro.linha}</td>
                      <td>{erro.mensagem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="filtros-container">
            <div className="filtro-item">
              <label htmlFor="filtroClasse">Filtrar por Classe:</label>
              <select
                id="filtroClasse"
                value={filtroClasse}
                onChange={(e) => setFiltroClasse(e.target.value)}
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
              <label htmlFor="filtroClasseInvestimento">Filtrar por Classe de Investimento:</label>
              <select
                id="filtroClasseInvestimento"
                value={filtroClasseInvestimento}
                onChange={(e) => setFiltroClasseInvestimento(e.target.value)}
              >
                <option value="">Todas as Classes de Investimento</option>
                {classesInvestimento.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtroClassificacao">Status de Classificação:</label>
              <select
                id="filtroClassificacao"
                value={filtroClassificacao}
                onChange={(e) => setFiltroClassificacao(e.target.value as 'todos' | 'classificados' | 'nao_classificados')}
              >
                <option value="todos">Todos</option>
                <option value="classificados">Classificados</option>
                <option value="nao_classificados">Não Classificados</option>
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="buscaGlobal">Busca Global:</label>
              <input
                type="text"
                id="buscaGlobal"
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
                placeholder="Buscar por nome, ticker, ISIN ou CNPJ..."
              />
            </div>

            <div className="filtro-item limpar-filtros">
              <button 
                onClick={() => {
                  setBuscaGlobal('');
                  setFiltroClasse('');
                  setFiltroClasseInvestimento('');
                  setFiltroClassificacao('todos');
                }}
                className="btn-limpar-filtros"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <div className="tabela-container">
            <table className="tabela-ativos">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Nome</th>
                  <th>Classe</th>
                  <th>Classe de Investimento</th>
                  <th>CNPJ</th>
                  <th>Ticker</th>
                  <th>ISIN</th>
                  <th>Indexador Primário</th>
                  <th>Tipo de Indexador</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ativosPaginados.length > 0 ? (
                  ativosPaginados.map((ativo) => {
                    const classificacao = classificacoes[ativo.id];
                    const indexadorPadrao = determinarIndexadorPadrao(ativo);
                    const classeInvestimentoPadrao = determinarClasseInvestimentoPadrao(ativo);
                    
                    // Use os valores da classificação existente ou os valores padrão
                    const classeInvestimentoAtual = classificacao?.classe_investimento || classeInvestimentoPadrao;
                    const indexadorAtual = classificacao?.indexador_primario || indexadorPadrao.valor;
                    const tipoIndexadorAtual = classificacao?.tipo_indexador || indexadorPadrao.tipo;
                    
                    const isClassificado = !!classificacao?.id;

                    return (
                      <tr key={ativo.id} className={isClassificado ? 'ativo-classificado' : 'ativo-nao-classificado'}>
                        <td>
                          <div className={`status-indicator ${isClassificado ? 'status-classificado' : 'status-nao-classificado'}`}>
                            {isClassificado ? 'Classificado' : 'Não Classificado'}
                          </div>
                        </td>
                        <td><TextHighlight text={ativo.nome} searchTerm={buscaGlobal} /></td>
                        <td><TextHighlight text={ativo.classe} searchTerm={buscaGlobal} /></td>
                        <td>
                          <select
                            value={classeInvestimentoAtual}
                            onChange={(e) => handleClassificacaoChange(
                              ativo.id, 
                              'classe_investimento',
                              e.target.value
                            )}
                            className="classe-investimento-select"
                          >
                            {classesInvestimento.map(classe => (
                              <option key={classe} value={classe}>
                                {classe}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td><TextHighlight text={ativo.cnpj ? formatarCNPJ(ativo.cnpj) : '-'} searchTerm={buscaGlobal} /></td>
                        <td><TextHighlight text={ativo.ticker || '-'} searchTerm={buscaGlobal} /></td>
                        <td><TextHighlight text={ativo.isin || '-'} searchTerm={buscaGlobal} /></td>
                        <td>
                          <input
                            type="text"
                            value={indexadorAtual}
                            onChange={(e) => handleClassificacaoChange(
                              ativo.id, 
                              'indexador_primario', 
                              e.target.value
                            )}
                            className="indexador-input"
                          />
                        </td>
                        <td>
                          <select
                            value={tipoIndexadorAtual}
                            onChange={(e) => {
                              const valor = e.target.value;
                              if (valor === 'cnpj' || valor === 'ticker' || valor === 'isin') {
                                handleClassificacaoChange(
                                  ativo.id, 
                                  'tipo_indexador',
                                  valor
                                );
                              }
                            }}
                            className="tipo-indexador-select"
                          >
                            <option value="cnpj">CNPJ</option>
                            <option value="ticker">Ticker</option>
                            <option value="isin">ISIN</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => salvarClassificacao(ativo.id)}
                            disabled={salvando}
                            className={`salvar-button ${isClassificado ? 'atualizar' : 'criar'}`}
                          >
                            {salvando ? 'Salvando...' : isClassificado ? 'Atualizar' : 'Salvar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="no-data">
                      Nenhum ativo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificarAtivos; 