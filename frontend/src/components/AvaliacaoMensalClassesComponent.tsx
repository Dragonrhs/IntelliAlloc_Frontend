import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomCard from './CustomCard';
import CustomButton from './CustomButton';
import { useTheme } from '../context/ThemeContext';
import './AvaliacaoMensalClassesComponent.css';

interface Parametro {
  id: number;
  nome_parametro: string;
  descricao: string;
  peso_padrao: number;
  ativo: boolean;
}

interface Avaliacao {
  id?: number;
  mes_referencia: string;
  classe_ativo: string;
  parametro_id: number;
  nome_parametro: string;
  peso: number;
  nota: number;
}

interface AvaliacaoMensalClassesComponentProps {
  mesSelecionado: string;
  onAvaliacaoSalva: () => void;
}

const CLASSES_ATIVO = [
  'Pós-Fixado',
  'Inflação',
  'Pré-Fixado',
  'Multimercado',
  'Renda Variável Brasil',
  'Fundos Listados',
  'Alternativos',
  'Renda Fixa Global',
  'Renda Variável Internacional'
] as const;

const AvaliacaoMensalClassesComponent: React.FC<AvaliacaoMensalClassesComponentProps> = ({
  mesSelecionado,
  onAvaliacaoSalva
}) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [existemAvaliacoes, setExistemAvaliacoes] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const carregarDados = async () => {
      await carregarParametros();
      if (mesSelecionado) {
        await carregarAvaliacoes();
      }
    };
    carregarDados();
  }, [mesSelecionado]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const inicializarAvaliacoes = (parametrosAtivos: Parametro[]) => {
    return CLASSES_ATIVO.flatMap((classe: string) =>
      parametrosAtivos.map((parametro: Parametro) => ({
        mes_referencia: mesSelecionado,
        classe_ativo: classe,
        parametro_id: parametro.id,
        nome_parametro: parametro.nome_parametro,
        peso: parametro.peso_padrao,
        nota: 0
      }))
    );
  };

  const carregarParametros = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando parâmetros...');
      const response = await axios.get('http://localhost:5000/api/parametros', {
        withCredentials: true
      });
      
      console.log('Resposta da API de parâmetros:', response.data);
      
      if (response.data && response.data.parametros && Array.isArray(response.data.parametros)) {
        const parametrosAtivos = response.data.parametros.filter((p: Parametro) => p.ativo);
        console.log('Parâmetros ativos:', parametrosAtivos);
        setParametros(parametrosAtivos);
        
        if (existemAvaliacoes === false) {
          const avaliacoesIniciais = inicializarAvaliacoes(parametrosAtivos);
          setAvaliacoes(avaliacoesIniciais);
        }
      } else {
        console.error('Formato de resposta inválido:', response.data);
        setErrorMessage('Erro ao carregar parâmetros: formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
      setErrorMessage('Erro ao carregar parâmetros de rebalanceamento');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarAvaliacoes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/avaliacao-parametros/${mesSelecionado}`, {
        withCredentials: true
      });
      
      if (response.data.avaliacoes && response.data.avaliacoes.length > 0) {
        setAvaliacoes(response.data.avaliacoes);
        setExistemAvaliacoes(true);
      } else {
        const avaliacoesIniciais = inicializarAvaliacoes(parametros);
        setAvaliacoes(avaliacoesIniciais);
        setExistemAvaliacoes(false);
      }
      setErrorMessage('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const avaliacoesIniciais = inicializarAvaliacoes(parametros);
        setAvaliacoes(avaliacoesIniciais);
        setExistemAvaliacoes(false);
        setErrorMessage('');
      } else {
        console.error('Erro ao carregar avaliações:', error);
        setErrorMessage('Erro ao carregar avaliações do mês selecionado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotaChange = (classeAtivo: string, parametroId: number, nota: string) => {
    const notaNumero = Math.min(Math.max(Number(nota), 0), 10);
    const novasAvaliacoes = [...avaliacoes];
    const index = novasAvaliacoes.findIndex(
      a => a.classe_ativo === classeAtivo && a.parametro_id === parametroId
    );
    
    if (index >= 0) {
      novasAvaliacoes[index] = { ...novasAvaliacoes[index], nota: notaNumero };
    } else {
      const parametro = parametros.find(p => p.id === parametroId);
      if (parametro) {
        novasAvaliacoes.push({ 
          mes_referencia: mesSelecionado,
          classe_ativo: classeAtivo, 
          parametro_id: parametroId,
          nome_parametro: parametro.nome_parametro,
          peso: parametro.peso_padrao,
          nota: notaNumero 
        });
      }
    }
    
    setAvaliacoes(novasAvaliacoes);
  };

  const getNota = (classeAtivo: string, parametroId: number) => {
    const avaliacao = avaliacoes.find(
      a => a.classe_ativo === classeAtivo && a.parametro_id === parametroId
    );
    return avaliacao?.nota || 0;
  };

  const salvarAvaliacoes = async () => {
    try {
      const avaliacoesCompletas = CLASSES_ATIVO.flatMap((classe: string) =>
        parametros.map((parametro: Parametro) => ({
          classe_ativo: classe,
          parametro_id: parametro.id,
          nota: getNota(classe, parametro.id)
        }))
      );

      await axios.post('http://localhost:5000/api/avaliacao-parametros', {
        mes_referencia: mesSelecionado,
        avaliacoes: avaliacoesCompletas
      }, {
        withCredentials: true
      });

      setSuccessMessage('Avaliações salvas com sucesso!');
      setErrorMessage('');
      setExistemAvaliacoes(true);
      onAvaliacaoSalva();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Erro ao salvar avaliações');
      setSuccessMessage('');
    }
  };

  const renderAvaliacoesGrid = () => {
    if (!avaliacoes.length) return null;

    const parametrosPorClasse: { [key: string]: Avaliacao[] } = {};
    avaliacoes.forEach(avaliacao => {
      if (!parametrosPorClasse[avaliacao.classe_ativo]) {
        parametrosPorClasse[avaliacao.classe_ativo] = [];
      }
      parametrosPorClasse[avaliacao.classe_ativo].push(avaliacao);
    });

    return (
      <div className="avaliacao-grid">
        {Object.entries(parametrosPorClasse).map(([classe, avaliacoesClasse]) => (
          <div key={classe} className="avaliacao-classe">
            <h3>{classe}</h3>
            <div className="parametros-grid">
              {avaliacoesClasse.map((avaliacao) => (
                <div key={`${avaliacao.classe_ativo}-${avaliacao.parametro_id}`} className="parametro-item">
                  <label>{avaliacao.nome_parametro} (Peso: {avaliacao.peso})</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={avaliacao.nota}
                    onChange={(e) => handleNotaChange(avaliacao.classe_ativo, avaliacao.parametro_id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!mesSelecionado) {
    return null;
  }

  if (isLoading) {
    return (
      <CustomCard className="avaliacao-mensal" isDarkMode={isDarkMode}>
        <div className="loading-container">
          <p>Carregando...</p>
        </div>
      </CustomCard>
    );
  }

  return (
    <CustomCard className="avaliacao-mensal" isDarkMode={isDarkMode}>
      <div className="avaliacao-header">
        <h3>Avaliação Mensal das Classes de Ativos</h3>
        <div className="status-info">
          {existemAvaliacoes !== null && (
            <span className={`status-badge ${existemAvaliacoes ? 'existente' : 'novo'}`}>
              {existemAvaliacoes ? 'Avaliação Existente' : 'Nova Avaliação'}
            </span>
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className={`error-message ${isDarkMode ? 'dark-mode' : ''}`}>
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className={`success-message ${isDarkMode ? 'dark-mode' : ''}`}>
          {successMessage}
        </div>
      )}

      {parametros.length === 0 ? (
        <div className="no-parameters-message">
          <p>Nenhum parâmetro de rebalanceamento ativo encontrado.</p>
          <p>Por favor, configure os parâmetros antes de realizar a avaliação mensal.</p>
        </div>
      ) : (
        renderAvaliacoesGrid()
      )}

      {parametros.length > 0 && (
        <div className="avaliacao-actions">
          <CustomButton onClick={salvarAvaliacoes} isDarkMode={isDarkMode}>
            {existemAvaliacoes ? 'Atualizar Avaliações' : 'Salvar Avaliações'}
          </CustomButton>
        </div>
      )}
    </CustomCard>
  );
};

export default AvaliacaoMensalClassesComponent; 