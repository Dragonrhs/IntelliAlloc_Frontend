import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './ViewAssetClassEvaluation.css';

interface Avaliacao {
  classe_ativo: string;
  nota: number;
}

interface ViewAssetClassEvaluationProps {
  mesSelecionado: string;
}

const ViewAssetClassEvaluation: React.FC<ViewAssetClassEvaluationProps> = ({ mesSelecionado }) => {
  const [avaliacoesAtuais, setAvaliacoesAtuais] = useState<Avaliacao[]>([]);
  const [avaliacoesAnteriores, setAvaliacoesAnteriores] = useState<Avaliacao[]>([]);
  const [erroMesAtual, setErroMesAtual] = useState<boolean>(false);
  const [erroMesAnterior, setErroMesAnterior] = useState<boolean>(false);
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
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setErroMesAtual(true);
      setErroMesAnterior(true);
    }
  };

  const renderVariacao = (avaliacaoAtual: number, avaliacaoAnterior: number) => {
    if (erroMesAnterior) {
      return <FontAwesomeIcon icon={faMinus} className="variacao manteve" />;
    }
    
    if (avaliacaoAtual > avaliacaoAnterior) {
      return <FontAwesomeIcon icon={faArrowUp} className="variacao subiu" />;
    } else if (avaliacaoAtual < avaliacaoAnterior) {
      return <FontAwesomeIcon icon={faArrowDown} className="variacao desceu" />;
    } else {
      return <FontAwesomeIcon icon={faMinus} className="variacao manteve" />;
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
            />
          ))}
        </div>
        <div className="indicadores">
          {!erroMesAnterior && <span className="indicador-anterior">Anterior</span>}
          <span className="indicador-atual">Atual</span>
        </div>
      </div>
    );
  };

  const renderMensagensErro = () => {
    if (erroMesAtual && erroMesAnterior) {
      return (
        <div className="erro-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="erro-icone" />
          <p>Não existem dados disponíveis para o mês selecionado e o mês anterior.</p>
        </div>
      );
    }

    if (erroMesAtual || erroMesAnterior) {
      return (
        <div className="aviso-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="aviso-icone" />
          <p>
            {erroMesAtual 
              ? 'Não existem dados para o mês selecionado.' 
              : 'Não existem dados do mês anterior para comparação.'}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`view-asset-class-evaluation ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {renderMensagensErro()}
      <div className="header">
        <div className="scale-labels">
          <div className="label-group">
            <span>Underweight</span>
            <div className="symbol-group">
              <span>--</span>
              <span>-</span>
            </div>
          </div>
          <div className="label-group">
            <span className="neutro-label">Neutro</span>
            <div className="symbol-group">
              <span>=</span>
            </div>
          </div>
          <div className="label-group">
            <span>Overweight</span>
            <div className="symbol-group">
              <span>+</span>
              <span>++</span>
            </div>
          </div>
          <div className="var-label">
            <span>Var.</span>
          </div>
        </div>
      </div>

      <div className="classes-container">
        <div className="renda-fixa-section">
          <h3>Renda Fixa Brasil</h3>
          <div className="classe-item">
            <span className="classe-nome">Pós Fixado</span>
            {renderBarraAvaliacao('Pós-Fixado')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Pós-Fixado')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Pós-Fixado')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Inflação</span>
            {renderBarraAvaliacao('Inflação')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Inflação')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Inflação')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Pré Fixado</span>
            {renderBarraAvaliacao('Pré-Fixado')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Pré-Fixado')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Pré-Fixado')?.nota || 0
              )}
            </div>
          </div>
        </div>

        <div className="classes-diversificacao">
          <div className="classe-item">
            <span className="classe-nome">Multimercado</span>
            {renderBarraAvaliacao('Multimercado')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Multimercado')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Multimercado')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Renda Variável Brasil</span>
            {renderBarraAvaliacao('Renda Variável Brasil')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Renda Variável Brasil')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Renda Variável Brasil')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Fundos Listados</span>
            {renderBarraAvaliacao('Fundos Listados')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Fundos Listados')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Fundos Listados')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Alternativos</span>
            {renderBarraAvaliacao('Alternativos')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Alternativos')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Alternativos')?.nota || 0
              )}
            </div>
          </div>
        </div>

        <div className="classes-internacional">
          <div className="classe-item">
            <span className="classe-nome">Renda Fixa Global</span>
            {renderBarraAvaliacao('Renda Fixa Global')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Renda Fixa Global')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Renda Fixa Global')?.nota || 0
              )}
            </div>
          </div>
          <div className="classe-item">
            <span className="classe-nome">Renda Variável Internacional</span>
            {renderBarraAvaliacao('Renda Variável Internacional')}
            <div className="variacao-container">
              {renderVariacao(
                avaliacoesAtuais.find(a => a.classe_ativo === 'Renda Variável Internacional')?.nota || 0,
                avaliacoesAnteriores.find(a => a.classe_ativo === 'Renda Variável Internacional')?.nota || 0
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssetClassEvaluation; 