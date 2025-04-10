import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

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

  return (
    <div className={`atualizar-ativo-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={true} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <CustomCard className="busca-card" isDarkMode={isDarkMode}>
          <h2>Buscar Ativo</h2>
          <div className="busca-form">
            <div className="input-group">
              <label>Tipo de Busca</label>
              <select
                value={tipoBusca}
                onChange={(e) => setTipoBusca(e.target.value as 'isin' | 'cnpj' | 'ticker')}
                className={isDarkMode ? 'dark-mode' : 'light-mode'}
              >
                <option value="isin">ISIN</option>
                <option value="cnpj">CNPJ</option>
                <option value="ticker">Ticker</option>
              </select>
            </div>
            <div className="input-group">
              <label>Valor</label>
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
            >
              Buscar
            </CustomButton>
          </div>
        </CustomCard>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {ativosEncontrados.length > 0 && !ativoSelecionado && (
          <CustomCard className="resultados-card" isDarkMode={isDarkMode}>
            <h3>Resultados da Busca</h3>
            <div className="resultados-list">
              {ativosEncontrados.map((ativo) => (
                <div
                  key={ativo.id}
                  className={`ativo-item ${isDarkMode ? 'dark-mode' : ''}`}
                  onClick={() => handleSelecionarAtivo(ativo)}
                >
                  <p><strong>Nome:</strong> {ativo.nome}</p>
                  <p><strong>Classe:</strong> {ativo.classe}</p>
                  <p><strong>Emissor:</strong> {ativo.emissor}</p>
                  {ativo.ticker && <p><strong>Ticker:</strong> {ativo.ticker}</p>}
                  {ativo.isin && <p><strong>ISIN:</strong> {ativo.isin}</p>}
                  <p><strong>CNPJ:</strong> {ativo.cnpj}</p>
                  <p><strong>Data:</strong> {formatarDataExibicao(ativo.data)}</p>
                  <p><strong>Status:</strong> {ativo.status}</p>
                </div>
              ))}
            </div>
          </CustomCard>
        )}

        {ativoSelecionado && (
          <CustomCard className="edicao-card" isDarkMode={isDarkMode}>
            <h3>Editar Ativo</h3>
            <div className="edicao-form">
              <div className="input-group">
                <label>Nome</label>
                <CustomInput
                  type="text"
                  name="nome"
                  value={ativoSelecionado.nome}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Classe</label>
                <select
                  name="classe"
                  value={ativoSelecionado.classe}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="Renda Fixa">Renda Fixa</option>
                  <option value="Fundos">Fundos</option>
                  <option value="Prev">Prev</option>
                  <option value="Listados">Listados</option>
                  <option value="Cetipados">Cetipados</option>
                  <option value="COE">COE</option>
                </select>
              </div>
              <div className="input-group">
                <label>Canal</label>
                <select
                  name="canal"
                  value={ativoSelecionado.canal}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="AAI">AAI</option>
                  <option value="MFO">MFO</option>
                  <option value="Todos">Todos</option>
                </select>
              </div>
              <div className="input-group">
                <label>Emissor</label>
                <CustomInput
                  type="text"
                  name="emissor"
                  value={ativoSelecionado.emissor}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Risco de Crédito</label>
                <CustomInput
                  type="text"
                  name="risco_credito"
                  value={ativoSelecionado.risco_credito}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Ticker</label>
                <CustomInput
                  type="text"
                  name="ticker"
                  value={ativoSelecionado.ticker || ''}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>ISIN</label>
                <CustomInput
                  type="text"
                  name="isin"
                  value={ativoSelecionado.isin || ''}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>CNPJ</label>
                <CustomInput
                  type="text"
                  name="cnpj"
                  value={ativoSelecionado.cnpj}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Gestora</label>
                <CustomInput
                  type="text"
                  name="gestora"
                  value={ativoSelecionado.gestora}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Prazo Total (meses)</label>
                <CustomInput
                  type="number"
                  name="prazo_total"
                  value={ativoSelecionado.prazo_total}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Data</label>
                <CustomInput
                  type="date"
                  name="data"
                  value={ativoSelecionado.data || ''}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                  required
                />
              </div>
              <div className="input-group">
                <label>Status</label>
                <select
                  name="status"
                  value={ativoSelecionado.status}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="Em Analise">Em Análise</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Reprovado">Reprovado</option>
                </select>
              </div>
              <div className="input-group">
                <label>Emissor ou Emissão</label>
                <select
                  name="emissor_emissao"
                  value={ativoSelecionado.emissor_emissao || ''}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="">Selecione...</option>
                  <option value="Emissor">Emissor</option>
                  <option value="Emissao">Emissão</option>
                </select>
              </div>
              <div className="input-group">
                <label>Analista Responsável</label>
                <CustomInput
                  type="text"
                  name="analista_responsavel"
                  value={ativoSelecionado.analista_responsavel}
                  onChange={handleInputChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="input-group">
                <label>Perfil</label>
                <select
                  name="perfil"
                  value={ativoSelecionado.perfil}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="Conservador">Conservador</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Sofisticado">Sofisticado</option>
                </select>
              </div>
              <div className="input-group">
                <label>Master ou Feeder</label>
                <select
                  name="master_feeder"
                  value={ativoSelecionado.master_feeder || ''}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="">Selecione...</option>
                  <option value="Master">Master</option>
                  <option value="Feeder">Feeder</option>
                </select>
              </div>
              <div className="input-group">
                <label>Restrito para alocação</label>
                <select
                  name="restrito_alocacao"
                  value={ativoSelecionado.restrito_alocacao || ''}
                  onChange={handleInputChange}
                  className={isDarkMode ? 'dark-mode' : 'light-mode'}
                >
                  <option value="">Não</option>
                  <option value="Restrito">Sim</option>
                </select>
              </div>
              <div className="button-group">
                <CustomButton
                  onClick={handleAtualizar}
                  isDarkMode={isDarkMode}
                  disabled={loading}
                >
                  Atualizar
                </CustomButton>
                <CustomButton
                  onClick={() => setAtivoSelecionado(null)}
                  isDarkMode={isDarkMode}
                  className="secondary"
                >
                  Cancelar
                </CustomButton>
              </div>
            </div>
          </CustomCard>
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