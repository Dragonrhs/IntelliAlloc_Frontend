import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faSave,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faStar,
  faStarHalf,
  faMinus,
  faPlus,
  faBalanceScale,
  faInfoCircle,
  faArrowDown,
  faArrowUp,
  faEquals
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CustomCard from './CustomCard';
import CustomButton from './CustomButton';
import Toast from './Toast';
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
  { valor: -2, label: 'Muito Underweight', icon: faArrowDown, color: '#ff6b6b' },
  { valor: -1, label: 'Underweight', icon: faArrowDown, color: '#ffa726' },
  { valor: 0, label: 'Neutro', icon: faEquals, color: '#4facfe' },
  { valor: 1, label: 'Overweight', icon: faArrowUp, color: '#66bb6a' },
  { valor: 2, label: 'Muito Overweight', icon: faArrowUp, color: '#4caf50' }
];

const AssetClassEvaluation: React.FC<AssetClassEvaluationProps> = ({ mesSelecionado, onAvaliacaoSalva }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (mesSelecionado) {
      carregarAvaliacoes();
    }
  }, [mesSelecionado]);

  useEffect(() => {
    if (successMessage) {
      setToastMessage(successMessage);
      setToastType('success');
      setShowToast(true);
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const carregarAvaliacoes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/avaliacao-classe/${mesSelecionado}`, {
        withCredentials: true
      });
      setAvaliacoes(response.data.avaliacoes);
      setToastMessage('Avaliações carregadas com sucesso!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setToastMessage('Erro ao carregar avaliações');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
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
      setToastMessage(error.response?.data?.error || 'Erro ao salvar avaliações');
      setToastType('error');
      setShowToast(true);
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotaIcon = (valor: number) => {
    const nota = NOTAS.find(n => n.valor === valor);
    return nota ? nota.icon : faEquals;
  };

  const getNotaColor = (valor: number) => {
    const nota = NOTAS.find(n => n.valor === valor);
    return nota ? nota.color : '#4facfe';
  };

  const getNotaLabel = (valor: number) => {
    const nota = NOTAS.find(n => n.valor === valor);
    return nota ? nota.label : 'Neutro';
  };

  if (!mesSelecionado) {
    return null;
  }

  return (
    <>
      <CustomCard className="asset-class-evaluation" isDarkMode={isDarkMode}>
        <div className="evaluation-header">
          <div className="header-info">
            <FontAwesomeIcon icon={faChartBar} className="header-icon" />
            <h3>Avaliação das Classes de Ativos</h3>
            <span className="month-badge">{mesSelecionado}</span>
          </div>
          <div className="scale-info">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Escala: -2 (Muito Underweight) a +2 (Muito Overweight)</span>
          </div>
        </div>
        
        {errorMessage && (
          <div className="message error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="message success">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="evaluation-grid">
          {CLASSES_ATIVO.map((classe, index) => {
            const avaliacao = avaliacoes.find(a => a.classe_ativo === classe);
            const notaAtual = avaliacao?.nota || 0;
            
            return (
              <div key={classe} className="evaluation-row" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="classe-info">
                  <span className="classe-name">{classe}</span>
                  {avaliacao && (
                    <div className="current-rating">
                      <FontAwesomeIcon 
                        icon={getNotaIcon(notaAtual)} 
                        style={{ color: getNotaColor(notaAtual) }}
                      />
                      <span className="rating-label">{getNotaLabel(notaAtual)}</span>
                    </div>
                  )}
                </div>
                <div className="nota-buttons">
                  {NOTAS.map(({ valor, label, icon, color }) => (
                    <button
                      key={valor}
                      className={`nota-button ${avaliacao?.nota === valor ? 'selected' : ''}`}
                      onClick={() => handleNotaChange(classe, valor)}
                      title={label}
                      style={{
                        borderColor: avaliacao?.nota === valor ? color : 'transparent',
                        backgroundColor: avaliacao?.nota === valor ? color : 'transparent'
                      }}
                    >
                      <FontAwesomeIcon icon={icon} />
                      <span className="nota-value">{valor}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="evaluation-actions">
          <CustomButton 
            onClick={salvarAvaliacoes} 
            isDarkMode={isDarkMode}
            disabled={isLoading}
            className="save-button"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="spinner" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>Salvar Avaliações</span>
              </>
            )}
          </CustomButton>
        </div>
      </CustomCard>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default AssetClassEvaluation; 