import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faEdit,
  faHistory,
  faSave,
  faTimes,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faArrowLeft,
  faDatabase,
  faBarcode,
  faIdCard,
  faBuilding,
  faShieldAlt,
  faChartLine,
  faUserTie,
  faClock,
  faCheckDouble,
  faUser,
  faSitemap,
  faBan,
  faCalendarAlt,
  faTag,
  faLayerGroup,
  faBroadcastTower,
  faCog,
  faFileAlt,
  faList,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './AtualizarAtivo.css';

interface Ativo {
  id: number;
  nome: string;
  classe: string;
  canal: string;
  emissor: string;
  risco_credito: string;
  ticker: string | null;
  isin: string | null;
  cnpj: string;
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

const AtualizarAtivo: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [tipoBusca, setTipoBusca] = useState<'isin' | 'cnpj' | 'ticker'>('isin');
  const [ativosEncontrados, setAtivosEncontrados] = useState<Ativo[]>([]);
  const [ativoSelecionado, setAtivoSelecionado] = useState<Ativo | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  // Mapeamento de ícones para campos
  const campoIcons = {
    nome: faFileAlt,
    classe: faLayerGroup,
    canal: faBroadcastTower,
    emissor: faBuilding,
    risco_credito: faShieldAlt,
    ticker: faChartLine,
    isin: faBarcode,
    cnpj: faIdCard,
    gestora: faUserTie,
    prazo_total: faClock,
    data: faCalendarAlt,
    status: faCheckDouble,
    emissor_emissao: faUser,
    analista_responsavel: faUserTie,
    perfil: faSitemap,
    master_feeder: faBan,
    restrito_alocacao: faBan
  };

  const formatarData = (data: string) => {
    if (!data) return '';
    
    try {
      // Se a data estiver no formato dd/mm/yyyy
      if (data.includes('/')) {
        const [dia, mes, ano] = data.split('/');
        const mesFormatado = mes.padStart(2, '0');
        const diaFormatado = dia.padStart(2, '0');
        return `${ano}-${mesFormatado}-${diaFormatado}`;
      }
      
      // Se a data estiver em formato GMT
      if (data.includes('GMT')) {
        const dataObj = new Date(data);
        // Ajusta o fuso horário para UTC
        const dataUTC = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);
        const ano = dataUTC.getFullYear();
        const mes = String(dataUTC.getMonth() + 1).padStart(2, '0');
        const dia = String(dataUTC.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      }
      
      return '';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  const formatarDataExibicao = (data: string) => {
    if (!data) return '';
    
    try {
      // Se a data estiver em formato GMT
      if (data.includes('GMT')) {
        const dataObj = new Date(data);
        // Ajusta o fuso horário para UTC
        const dataUTC = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);
        const dia = String(dataUTC.getDate()).padStart(2, '0');
        const mes = String(dataUTC.getMonth() + 1).padStart(2, '0');
        const ano = dataUTC.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }

      // Para outros formatos
      const partes = data.includes('-') ? data.split('-').reverse() : data.split('/');
      if (partes.length !== 3) return data;
      
      return partes.join('/');
    } catch (error) {
      console.error('Erro ao formatar data para exibição:', error);
      return data;
    }
  };

  const handleBuscar = async () => {
    if (!busca.trim()) {
      setErrorMessage('Por favor, insira um valor para busca');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(`http://localhost:5000/api/ativos/buscar?tipo=${tipoBusca}&valor=${busca}`, {
        withCredentials: true
      });
      setAtivosEncontrados(response.data.ativos);
      if (response.data.ativos.length === 0) {
        setErrorMessage('Nenhum ativo encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao buscar ativos:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao buscar ativos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarAtivo = (ativo: Ativo) => {
    const dataOriginal = ativo.data;
    const dataFormatada = formatarData(dataOriginal);
    
    if (!dataFormatada) {
      return;
    }
    
    setAtivoSelecionado({
      ...ativo,
      data: dataFormatada
    });
  };

  const handleAtualizar = async () => {
    if (!ativoSelecionado) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // Converter a data para o formato YYYY-MM-DD
      const dadosParaEnviar = {
        ...ativoSelecionado,
        data: ativoSelecionado.data.includes('/') 
          ? ativoSelecionado.data.split('/').reverse().join('-')
          : ativoSelecionado.data
      };

      // Tratar campos que podem ser NULL ou vazios
      const dadosTratados = {
        ...dadosParaEnviar,
        master_feeder: dadosParaEnviar.master_feeder || null,
        emissor_emissao: dadosParaEnviar.emissor_emissao || null,
        restrito_alocacao: dadosParaEnviar.restrito_alocacao === 'Restrito' ? 'Restrito' : null,
        isin: dadosParaEnviar.isin || null,
        ticker: dadosParaEnviar.ticker || null,
        cnpj: dadosParaEnviar.cnpj ? dadosParaEnviar.cnpj.replace(/[^\d]/g, '') : null,
        nome: dadosParaEnviar.nome || null,
        emissor: dadosParaEnviar.emissor || null,
        risco_credito: dadosParaEnviar.risco_credito || null
      };

      // Verificar campos obrigatórios baseados na classe
      const camposObrigatoriosPorClasse: Record<string, string[]> = {
        "Renda Fixa": [
          "canal",
          "risco_credito",
          "emissor",
          "ticker",
          "prazo_total",
          "status",
          "data",
          "emissor_emissao",
          "perfil",
          "analista_responsavel"
        ],
        "Fundos": [
          "cnpj",
          "gestora",
          "prazo_total",
          "data",
          "canal",
          "master_feeder",
          "perfil",
          "analista_responsavel",
          "status"
        ],
        "Prev": [
          "cnpj",
          "gestora",
          "prazo_total",
          "data",
          "canal",
          "perfil",
          "analista_responsavel",
          "status"
        ],
        "Listados": [
          "ticker",
          "gestora",
          "prazo_total",
          "data",
          "canal",
          "perfil",
          "status",
          "analista_responsavel"
        ],
        "Cetipados": [
          "ticker",
          "cnpj",
          "gestora",
          "prazo_total",
          "data",
          "canal",
          "perfil",
          "status",
          "analista_responsavel"
        ],
        "COE": [
          "isin",
          "prazo_total",
          "data",
          "canal",
          "perfil",
          "status",
          "analista_responsavel"
        ],
        "Fundos Internacionais": ["isin", "gestora", "prazo_total", "data", "canal", "perfil"],
        "Renda Fixa Internacional": ["isin", "risco_credito", "emissor", "prazo_total", "data", "canal", "emissor_emissao", "perfil"]
      };

      const camposEmBrancoPorClasse: Record<string, string[]> = {
        "Renda Fixa": ["isin", "cnpj", "gestora", "master_feeder"],
        "Fundos": ["isin", "emissor", "risco_credito", "ticker", "emissor_emissao"],
        "Prev": ["emissor", "risco_credito", "ticker", "emissor_emissao", "master_feeder"],
        "Listados": ["emissor", "risco_credito", "emissor_emissao", "master_feeder"],
        "Cetipados": ["emissor", "risco_credito", "emissor_emissao", "master_feeder"],
        "COE": ["ticker", "cnpj", "master_feeder"],
        "Fundos Internacionais": ["emissor", "risco_credito", "ticker", "cnpj", "emissor_emissao", "master_feeder"],
        "Renda Fixa Internacional": ["cnpj", "gestora", "master_feeder"]
      };

      const classeAtivo = dadosTratados.classe;
      const camposObrigatorios = camposObrigatoriosPorClasse[classeAtivo] || [];
      const camposEmBranco = camposEmBrancoPorClasse[classeAtivo] || [];

      // Verificar campos obrigatórios
      const camposFaltantes = camposObrigatorios.filter((campo: string) => !dadosTratados[campo as keyof typeof dadosTratados]);
      
      if (camposFaltantes.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`);
      }

      // Verificar campos que devem estar em branco
      const camposComValor = camposEmBranco.filter((campo: string) => dadosTratados[campo as keyof typeof dadosTratados]);
      if (camposComValor.length > 0) {
        throw new Error(`Os seguintes campos devem estar em branco: ${camposComValor.join(', ')}`);
      }

      // Remove campos undefined e null
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosTratados)
          .filter(([_, value]) => value !== undefined && value !== null)
      );

      try {
        const response = await axios.put(
          `http://localhost:5000/api/ativos/${ativoSelecionado.id}`,
          dadosLimpos,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          setToastMessage('Ativo atualizado com sucesso!');
          setToastType('success');
          setShowToast(true);
          
          setTimeout(() => {
            setAtivoSelecionado(null);
            setAtivosEncontrados([]);
            setBusca('');
          }, 1000);
        } else {
          throw new Error('Erro ao atualizar ativo');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Erro ao atualizar ativo. Por favor, tente novamente.';
        setErrorMessage(errorMessage);
        setToastMessage(errorMessage);
        setToastType('error');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro ao atualizar ativo';
      setErrorMessage(errorMessage);
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!ativoSelecionado) return;
    
    const { name, value } = e.target;
    
    if (name === 'data') {
      setAtivoSelecionado({
        ...ativoSelecionado,
        data: value
      });
    } else {
      setAtivoSelecionado({
        ...ativoSelecionado,
        [name]: value
      });
    }
  };

  const handleVerHistorico = () => {
    if (ativoSelecionado) {
      navigate(`/historico-ativo/${ativoSelecionado.id}`);
    }
  };

  const renderCampo = (campo: string, label: string, type: string = 'text', options?: string[]) => {
    const IconComponent = campoIcons[campo as keyof typeof campoIcons];
    
    return (
      <div className="input-group" key={campo}>
        <label>
          <FontAwesomeIcon icon={IconComponent} />
          {label}
        </label>
        {type === 'select' ? (
          <select
            name={campo}
            value={ativoSelecionado?.[campo as keyof Ativo] || ''}
            onChange={handleInputChange}
            className={`modern-select ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            disabled={loading}
          >
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <CustomInput
            type={type}
            name={campo}
            value={ativoSelecionado?.[campo as keyof Ativo] || ''}
            onChange={handleInputChange}
            isDarkMode={isDarkMode}
            disabled={loading}
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className={`atualizar-ativo-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${!isBackgroundAnimationEnabled ? 'no-animation' : ''}`}
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
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <CustomCard className="atualizar-header" isDarkMode={isDarkMode}>
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faEdit} />
              <h1>Atualizar Ativo</h1>
            </div>
            <p>Busque e atualize informações dos ativos cadastrados no sistema</p>
          </div>
        </CustomCard>

        {/* Seção de Busca */}
        <div className="busca-section">
          <CustomCard className="busca-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <FontAwesomeIcon icon={faSearch} />
              <h3>Buscar Ativo</h3>
            </div>
            <div className="busca-form">
              <div className="search-controls">
                <div className="input-group">
                  <label>
                    <FontAwesomeIcon icon={faDatabase} />
                    Tipo de Busca
                  </label>
                  <select
                    value={tipoBusca}
                    onChange={(e) => setTipoBusca(e.target.value as 'isin' | 'cnpj' | 'ticker')}
                    className={`modern-select ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
                  >
                    <option value="isin">ISIN</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="ticker">Ticker</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>
                    <FontAwesomeIcon icon={faBarcode} />
                    Valor
                  </label>
                  <CustomInput
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={`Digite o ${tipoBusca.toUpperCase()}`}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <CustomButton
                  onClick={handleBuscar}
                  isDarkMode={isDarkMode}
                  disabled={loading}
                  className="search-button"
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faSearch} />
                  )}
                  Buscar
                </CustomButton>
              </div>
            </div>
          </CustomCard>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Resultados da Busca */}
        {ativosEncontrados.length > 0 && !ativoSelecionado && (
          <div className="resultados-section">
            <CustomCard className="resultados-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <FontAwesomeIcon icon={faList} />
                <h3>Resultados da Busca</h3>
                <span className="results-count">{ativosEncontrados.length} ativo(s) encontrado(s)</span>
              </div>
              <div className="resultados-grid">
                {ativosEncontrados.map((ativo) => (
                  <div
                    key={ativo.id}
                    className="ativo-card"
                    onClick={() => handleSelecionarAtivo(ativo)}
                  >
                    <div className="ativo-header">
                      <FontAwesomeIcon icon={faFileAlt} />
                      <h4>{ativo.nome}</h4>
                    </div>
                    <div className="ativo-details">
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faLayerGroup} />
                        <span><strong>Classe:</strong> {ativo.classe}</span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span><strong>Emissor:</strong> {ativo.emissor}</span>
                      </div>
                      {ativo.ticker && (
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faChartLine} />
                          <span><strong>Ticker:</strong> {ativo.ticker}</span>
                        </div>
                      )}
                      {ativo.isin && (
                        <div className="detail-item">
                          <FontAwesomeIcon icon={faBarcode} />
                          <span><strong>ISIN:</strong> {ativo.isin}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faIdCard} />
                        <span><strong>CNPJ:</strong> {ativo.cnpj}</span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span><strong>Data:</strong> {formatarDataExibicao(ativo.data)}</span>
                      </div>
                      <div className="detail-item">
                        <FontAwesomeIcon icon={faCheckDouble} />
                        <span><strong>Status:</strong> {ativo.status}</span>
                      </div>
                    </div>
                    <div className="ativo-actions">
                      <FontAwesomeIcon icon={faEye} />
                      <span>Clique para editar</span>
                    </div>
                  </div>
                ))}
              </div>
            </CustomCard>
          </div>
        )}

        {/* Formulário de Edição */}
        {ativoSelecionado && (
          <div className="edicao-section">
            <CustomCard className="edicao-card" isDarkMode={isDarkMode}>
              <div className="card-header">
                <div className="header-info">
                  <FontAwesomeIcon icon={faEdit} />
                  <h3>Editar Ativo</h3>
                  <span className="ativo-id">ID: {ativoSelecionado.id}</span>
                </div>
                <CustomButton
                  onClick={handleVerHistorico}
                  isDarkMode={isDarkMode}
                  className="historico-button"
                >
                  <FontAwesomeIcon icon={faHistory} />
                  Ver Histórico
                </CustomButton>
              </div>
              
              <div className="edicao-form">
                <div className="form-section">
                  <h4>Informações Básicas</h4>
                  <div className="form-grid">
                    {renderCampo('nome', 'Nome')}
                    {renderCampo('classe', 'Classe', 'select', [
                      'Renda Fixa', 'Fundos', 'Prev', 'Listados', 'Cetipados', 'COE'
                    ])}
                    {renderCampo('canal', 'Canal', 'select', ['AAI', 'MFO', 'Todos'])}
                    {renderCampo('emissor', 'Emissor')}
                    {renderCampo('risco_credito', 'Risco de Crédito')}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Identificação</h4>
                  <div className="form-grid">
                    {renderCampo('ticker', 'Ticker')}
                    {renderCampo('isin', 'ISIN')}
                    {renderCampo('cnpj', 'CNPJ')}
                    {renderCampo('gestora', 'Gestora')}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Características</h4>
                  <div className="form-grid">
                    {renderCampo('prazo_total', 'Prazo Total (meses)', 'number')}
                    {renderCampo('data', 'Data', 'date')}
                    {renderCampo('status', 'Status', 'select', [
                      'Em Analise', 'Aprovado', 'Reprovado'
                    ])}
                    {renderCampo('emissor_emissao', 'Emissor ou Emissão', 'select', [
                      '', 'Emissor', 'Emissao'
                    ])}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Responsabilidade</h4>
                  <div className="form-grid">
                    {renderCampo('analista_responsavel', 'Analista Responsável')}
                    {renderCampo('perfil', 'Perfil', 'select', [
                      'Conservador', 'Moderado', 'Sofisticado'
                    ])}
                    {renderCampo('master_feeder', 'Master ou Feeder', 'select', [
                      '', 'Master', 'Feeder'
                    ])}
                    {renderCampo('restrito_alocacao', 'Restrito para alocação', 'select', [
                      '', 'Não', 'Restrito'
                    ])}
                  </div>
                </div>

                <div className="form-actions">
                  <CustomButton
                    onClick={handleAtualizar}
                    isDarkMode={isDarkMode}
                    disabled={loading}
                    className="save-button"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faSave} />
                    )}
                    Atualizar
                  </CustomButton>
                  <CustomButton
                    onClick={() => setAtivoSelecionado(null)}
                    isDarkMode={isDarkMode}
                    className="cancel-button"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancelar
                  </CustomButton>
                </div>
              </div>
            </CustomCard>
          </div>
        )}
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

export default AtualizarAtivo; 