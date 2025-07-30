import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowUp, 
  faArrowDown, 
  faMinus, 
  faExclamationTriangle,
  faChartBar,
  faChartLine,
  faEquals,
  faSpinner,
  faInfoCircle,
  faShieldAlt,
  faGlobe,
  faCoins,
  faBuilding,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import CustomCard from './CustomCard';
import Toast from './Toast';
import './ViewAssetClassEvaluation.css';

interface Avaliacao {
  classe_ativo: string;
  nota: number;
}

interface ViewAssetClassEvaluationProps {
  mesSelecionado: string;
}

const CLASSES_ICONS: Record<string, any> = {
  'Pós-Fixado': faShieldAlt,
  'Inflação': faChartLine,
  'Pré-Fixado': faChartLine,
  'Multimercado': faCoins,
  'Renda Variável Brasil': faBuilding,
  'Fundos Listados': faChartBar,
  'Alternativos': faRocket,
  'Renda Fixa Global': faGlobe,
  'Renda Variável Internacional': faGlobe
};

const ViewAssetClassEvaluation: React.FC<ViewAssetClassEvaluationProps> = ({ mesSelecionado }) => {
  const [avaliacoesAtuais, setAvaliacoesAtuais] = useState<Avaliacao[]>([]);
  const [avaliacoesAnteriores, setAvaliacoesAnteriores] = useState<Avaliacao[]>([]);
  const [erroMesAtual, setErroMesAtual] = useState<boolean>(false);
  const [erroMesAnterior, setErroMesAnterior] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (mesSelecionado) {
      carregarAvaliacoes();
    }
  }, [mesSelecionado]);

  const getMesAnterior = (mes: string): string => {
    const [ano, mes_num] = mes.split('-');
    const data = new Date(parseInt(ano), parseInt(mes_num) - 1, 1);
    data.setMonth(data.getMonth() - 1);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  };

  const carregarAvaliacoes = async () => {
    try {
      setIsLoading(true);
      const mesAnterior = getMesAnterior(mesSelecionado);
      
      const [resAtual, resAnterior] = await Promise.all([
        axios.get(`http://localhost:5000/api/avaliacao-classe/${mesSelecionado}`, {
          withCredentials: true
        }),
        axios.get(`http://localhost:5000/api/avaliacao-classe/${mesAnterior}`, {
          withCredentials: true
        })
      ]);

      if (resAtual.data.avaliacoes && resAtual.data.avaliacoes.length > 0) {
        setAvaliacoesAtuais(resAtual.data.avaliacoes);
        setErroMesAtual(false);
      } else {
        setAvaliacoesAtuais([]);
        setErroMesAtual(true);
      }

      if (resAnterior.data.avaliacoes && resAnterior.data.avaliacoes.length > 0) {
        setAvaliacoesAnteriores(resAnterior.data.avaliacoes);
        setErroMesAnterior(false);
      } else {
        setAvaliacoesAnteriores([]);
        setErroMesAnterior(true);
      }

      setToastMessage('Avaliações carregadas com sucesso!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setErroMesAtual(true);
      setErroMesAnterior(true);
      setToastMessage('Erro ao carregar avaliações');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVariacao = (avaliacaoAtual: number, avaliacaoAnterior: number) => {
    if (erroMesAnterior) {
      return (
        <div className="variacao-wrapper manteve">
          <FontAwesomeIcon icon={faMinus} className="variacao-icon" />
          <span className="variacao-label">N/A</span>
        </div>
      );
    }
    
    if (avaliacaoAtual > avaliacaoAnterior) {
      return (
        <div className="variacao-wrapper subiu">
          <FontAwesomeIcon icon={faArrowUp} className="variacao-icon" />
          <span className="variacao-label">Subiu</span>
        </div>
      );
    } else if (avaliacaoAtual < avaliacaoAnterior) {
      return (
        <div className="variacao-wrapper desceu">
          <FontAwesomeIcon icon={faArrowDown} className="variacao-icon" />
          <span className="variacao-label">Desceu</span>
        </div>
      );
    } else {
      return (
        <div className="variacao-wrapper manteve">
          <FontAwesomeIcon icon={faEquals} className="variacao-icon" />
          <span className="variacao-label">Manteve</span>
        </div>
      );
    }
  };

  const renderBarraAvaliacao = (classe: string) => {
    const avaliacaoAtual = avaliacoesAtuais.find(a => a.classe_ativo === classe)?.nota || 0;
    const avaliacaoAnterior = avaliacoesAnteriores.find(a => a.classe_ativo === classe)?.nota || 0;

    return (
      <div className="barra-container">
        <div className="barra-avaliacao">
          {[-2, -1, 0, 1, 2].map((nota) => (
            <div 
              key={nota} 
              className={`barra-celula ${
                avaliacaoAtual === nota ? 'atual' : 
                (!erroMesAnterior && avaliacaoAnterior === nota && avaliacaoAtual !== nota) ? 'anterior' : ''
              }`}
              title={`Nota: ${nota}`}
            />
          ))}
        </div>
        <div className="indicadores">
          {!erroMesAnterior && (
            <div className="indicador-anterior">
              <div className="indicador-dot anterior"></div>
              <span>Anterior</span>
            </div>
          )}
          <div className="indicador-atual">
            <div className="indicador-dot atual"></div>
            <span>Atual</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMensagensErro = () => {
    if (erroMesAtual && erroMesAnterior) {
      return (
        <CustomCard className="erro-container" isDarkMode={isDarkMode}>
          <div className="erro-content">
            <FontAwesomeIcon icon={faExclamationTriangle} className="erro-icone" />
            <div className="erro-text">
              <h3>Dados Indisponíveis</h3>
              <p>Não existem dados disponíveis para o mês selecionado e o mês anterior.</p>
            </div>
          </div>
        </CustomCard>
      );
    }

    if (erroMesAtual || erroMesAnterior) {
      return (
        <CustomCard className="aviso-container" isDarkMode={isDarkMode}>
          <div className="aviso-content">
            <FontAwesomeIcon icon={faInfoCircle} className="aviso-icone" />
            <div className="aviso-text">
              <h3>Aviso</h3>
              <p>
                {erroMesAtual 
                  ? 'Não existem dados para o mês selecionado.' 
                  : 'Não existem dados do mês anterior para comparação.'}
              </p>
            </div>
          </div>
        </CustomCard>
      );
    }

    return null;
  };

  const renderClasseItem = (classe: string, index: number) => {
    const avaliacaoAtual = avaliacoesAtuais.find(a => a.classe_ativo === classe)?.nota || 0;
    const avaliacaoAnterior = avaliacoesAnteriores.find(a => a.classe_ativo === classe)?.nota || 0;
    const icon = CLASSES_ICONS[classe] || faChartBar;

    return (
      <div key={classe} className="classe-item" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="classe-info">
          <FontAwesomeIcon icon={icon} className="classe-icon" />
          <span className="classe-nome">{classe}</span>
        </div>
        {renderBarraAvaliacao(classe)}
        <div className="variacao-container">
          {renderVariacao(avaliacaoAtual, avaliacaoAnterior)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
        <p>Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <>
      <CustomCard className="view-asset-class-evaluation" isDarkMode={isDarkMode}>
        {renderMensagensErro()}
        
        <div className="evaluation-header">
          <div className="header-info">
            <FontAwesomeIcon icon={faChartBar} className="header-icon" />
            <div className="header-text">
              <h2>Visualização de Avaliações</h2>
              <p>Comparação entre mês atual e anterior</p>
            </div>
          </div>
          <div className="month-badge">
            <span>{mesSelecionado}</span>
          </div>
        </div>

        <div className="scale-header">
          <div className="scale-labels">
            <div className="label-group">
              <span className="label-title">Underweight</span>
              <div className="symbol-group">
                <span className="symbol">--</span>
                <span className="symbol">-</span>
              </div>
            </div>
            <div className="label-group">
              <span className="label-title neutro">Neutro</span>
              <div className="symbol-group">
                <span className="symbol">=</span>
              </div>
            </div>
            <div className="label-group">
              <span className="label-title">Overweight</span>
              <div className="symbol-group">
                <span className="symbol">+</span>
                <span className="symbol">++</span>
              </div>
            </div>
            <div className="var-label">
              <span>Var.</span>
            </div>
          </div>
        </div>

        <div className="classes-container">
          <div className="section-group">
            <div className="section-header">
              <FontAwesomeIcon icon={faShieldAlt} className="section-icon" />
              <h3>Renda Fixa Brasil</h3>
            </div>
            <div className="section-content">
              {renderClasseItem('Pós-Fixado', 0)}
              {renderClasseItem('Inflação', 1)}
              {renderClasseItem('Pré-Fixado', 2)}
            </div>
          </div>

          <div className="section-group">
            <div className="section-header">
              <FontAwesomeIcon icon={faCoins} className="section-icon" />
              <h3>Parcela de Risco</h3>
            </div>
            <div className="section-content">
              {renderClasseItem('Multimercado', 3)}
              {renderClasseItem('Renda Variável Brasil', 4)}
              {renderClasseItem('Fundos Listados', 5)}
              {renderClasseItem('Alternativos', 6)}
            </div>
          </div>

          <div className="section-group">
            <div className="section-header">
              <FontAwesomeIcon icon={faGlobe} className="section-icon" />
              <h3>Internacional</h3>
            </div>
            <div className="section-content">
              {renderClasseItem('Renda Fixa Global', 7)}
              {renderClasseItem('Renda Variável Internacional', 8)}
            </div>
          </div>
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

export default ViewAssetClassEvaluation; 