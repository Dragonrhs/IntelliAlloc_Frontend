import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomCard from './CustomCard';
import CustomButton from './CustomButton';
import { useTheme } from '../context/ThemeContext';
import './AssetClassEvaluation.css';

interface Avaliacao {
  classe_ativo: string;
  nota: number;
}

interface AssetClassEvaluationProps {
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
];

const NOTAS = [
  { valor: -2, label: 'Muito Underweight' },
  { valor: -1, label: 'Underweight' },
  { valor: 0, label: 'Neutro' },
  { valor: 1, label: 'Overweight' },
  { valor: 2, label: 'Muito Overweight' }
];

const AssetClassEvaluation: React.FC<AssetClassEvaluationProps> = ({ mesSelecionado, onAvaliacaoSalva }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (mesSelecionado) {
      carregarAvaliacoes();
    }
  }, [mesSelecionado]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const carregarAvaliacoes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/avaliacao-classe/${mesSelecionado}`, {
        withCredentials: true
      });
      setAvaliacoes(response.data.avaliacoes);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const handleNotaChange = (classeAtivo: string, nota: number) => {
    const novasAvaliacoes = [...avaliacoes];
    const index = novasAvaliacoes.findIndex(a => a.classe_ativo === classeAtivo);
    
    if (index >= 0) {
      novasAvaliacoes[index] = { ...novasAvaliacoes[index], nota };
    } else {
      novasAvaliacoes.push({ classe_ativo: classeAtivo, nota });
    }
    
    setAvaliacoes(novasAvaliacoes);
  };

  const salvarAvaliacoes = async () => {
    try {
      await axios.post('http://localhost:5000/api/avaliacao-classe/adicionar', {
        mes_referencia: mesSelecionado,
        avaliacoes: CLASSES_ATIVO.map(classe => ({
          classe_ativo: classe,
          nota: avaliacoes.find(a => a.classe_ativo === classe)?.nota || 0
        }))
      }, {
        withCredentials: true
      });

      setSuccessMessage('Avaliações salvas com sucesso!');
      setErrorMessage('');
      onAvaliacaoSalva();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Erro ao salvar avaliações');
      setSuccessMessage('');
    }
  };

  if (!mesSelecionado) {
    return null;
  }

  return (
    <CustomCard className="asset-class-evaluation" isDarkMode={isDarkMode}>
      <div className="evaluation-header">
        <h3>Avaliação das Classes de Ativos</h3>
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

      <div className="evaluation-grid">
        {CLASSES_ATIVO.map(classe => (
          <div key={classe} className="evaluation-row">
            <span className="classe-name">{classe}</span>
            <div className="nota-buttons">
              {NOTAS.map(({ valor, label }) => (
                <button
                  key={valor}
                  className={`nota-button ${avaliacoes.find(a => a.classe_ativo === classe)?.nota === valor ? 'selected' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
                  onClick={() => handleNotaChange(classe, valor)}
                  title={label}
                >
                  {valor}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="evaluation-actions">
        <CustomButton onClick={salvarAvaliacoes} isDarkMode={isDarkMode}>
          Salvar Avaliações
        </CustomButton>
      </div>
    </CustomCard>
  );
};

export default AssetClassEvaluation; 