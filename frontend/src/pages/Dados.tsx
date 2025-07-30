import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useLoading } from '../context/LoadingContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import CustomInput from '../components/CustomInput';
import Toast from '../components/Toast';
import './Dados.css';

interface AtivoPrioritario {
  id?: number;
  codigo: string;
  descricao: string;
  ordem: number;
}

interface Portfolio {
  nome_portfolio: string;
  quantidade_ativos: number;
  resposta_api: {
    status?: string;
    [key: string]: any;
  };
}

interface Estatisticas {
  total_ativos_encontrados: number;
  total_portfolio: number;
  ativos_prioritarios: number;
  ativos_cri_cdca_cra: number;
  ativos_deb: number;
  ativos_outros: number;
  status: Record<string, number>;
}

interface DetalheDistribuicao {
  grupo: number;
  portfolio: string;
  quantidade_ativos: number;
  limite_maximo: number;
  dentro_limite: boolean;
}

interface ResultadoApi {
  message?: string;
  portfolios?: Portfolio[];
  quantidade_total_ativos?: number;
  estatisticas?: Estatisticas;
  detalhes_distribuicao?: DetalheDistribuicao[];
  nome_portfolio?: string;
  quantidade_ativos?: number;
}

const Dados: React.FC = () => {
  const { user } = useUser();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });
  const [showToast, setShowToast] = useState<boolean>(false);
  const [resultadoApi, setResultadoApi] = useState<ResultadoApi | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  // Estados para atualização de dados
  const [isUpdatingData, setIsUpdatingData] = useState<boolean>(false);
  const [updateProgressStep, setUpdateProgressStep] = useState<number>(0);
  const [updateProgressMessage, setUpdateProgressMessage] = useState<string>('');
  const [updateStartTime, setUpdateStartTime] = useState<number>(0);
  const [updateElapsedTime, setUpdateElapsedTime] = useState<number>(0);
  const [updateResult, setUpdateResult] = useState<any>(null);
  
  // Estados para ativos prioritários
  const [ativosPrioritarios, setAtivosPrioritarios] = useState<AtivoPrioritario[]>([]);
  const [novoAtivo, setNovoAtivo] = useState<AtivoPrioritario>({ codigo: '', descricao: '', ordem: 0 });
  const [modoEdicao, setModoEdicao] = useState<number | null>(null);

  // Carregar ativos prioritários ao montar o componente
  useEffect(() => {
    carregarAtivosPrioritarios();
  }, []);

  // Efeito para atualizar o tempo decorrido
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && startTime > 0) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating, startTime]);

  // Efeito para atualizar o tempo decorrido da atualização de dados
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUpdatingData && updateStartTime > 0) {
      timer = setInterval(() => {
        setUpdateElapsedTime(Math.floor((Date.now() - updateStartTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isUpdatingData, updateStartTime]);

  const carregarAtivosPrioritarios = async () => {
    try {
      showLoading('Carregando ativos prioritários...');
      const response = await axios.get('http://localhost:5000/api/ativos-prioritarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      setAtivosPrioritarios(response.data.ativos_prioritarios || []);
    } catch (error: any) {
      console.error('Erro ao carregar ativos prioritários:', error);
      setToast({
        message: error.response?.data?.error || 'Erro ao carregar ativos prioritários',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      hideLoading();
    }
  };

  const handleGerarPortfolio = async () => {
    try {
      setIsGenerating(true);
      setProgressStep(1);
      setProgressMessage('Conectando ao servidor...');
      setStartTime(Date.now());
      setElapsedTime(0);
      showLoading('Gerando portfólio...');
      
      setTimeout(() => {
        setProgressStep(2);
        setProgressMessage('Buscando ativos no banco de dados...');
      }, 1000);
      
      const response = await axios.post('http://localhost:5000/api/portfolio/gerar', {
        nome_portfolio: 'ativos_Research'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      setProgressStep(3);
      setProgressMessage('Processando resposta...');
      
      setTimeout(() => {
        setProgressStep(4);
        setProgressMessage('Portfólio gerado com sucesso!');
        setResultadoApi(response.data);
        
        // Mensagem de sucesso adaptada para múltiplos portfólios
        const qtdPortfolios = response.data.portfolios?.length || 0;
        const mensagem = qtdPortfolios > 1 
          ? `${qtdPortfolios} portfólios gerados com sucesso! Total de ${response.data.quantidade_total_ativos} ativos distribuídos.`
          : `Portfólio gerado com sucesso! ${response.data.quantidade_total_ativos || response.data.quantidade_ativos} ativos incluídos.`;
          
        setToast({
          message: mensagem,
          type: 'success'
        });
        setShowToast(true);
      }, 500);
      
    } catch (error: any) {
      console.error('Erro ao gerar portfólio:', error);
      setProgressStep(0);
      setProgressMessage('');
      setToast({
        message: error.response?.data?.error || 'Erro ao gerar portfólio',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      setTimeout(() => {
        hideLoading();
        setIsGenerating(false);
        setProgressStep(0);
        setProgressMessage('');
        setStartTime(0);
      }, 1000);
    }
  };

  const handleAtualizarDados = async () => {
    try {
      setIsUpdatingData(true);
      setUpdateProgressStep(1);
      setUpdateProgressMessage('Conectando ao Comdinheiro...');
      setUpdateStartTime(Date.now());
      setUpdateElapsedTime(0);
      showLoading('Atualizando dados dos portfólios...');
      
      setTimeout(() => {
        setUpdateProgressStep(2);
        setUpdateProgressMessage('Testando portfólios disponíveis...');
      }, 1000);
      
      setTimeout(() => {
        setUpdateProgressStep(3);
        setUpdateProgressMessage('Buscando dados históricos...');
      }, 2000);
      
      const response = await axios.post('http://localhost:5000/atualizar-dados', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      setUpdateProgressStep(4);
      setUpdateProgressMessage('Salvando dados no banco...');
      
      setTimeout(() => {
        setUpdateProgressStep(5);
        setUpdateProgressMessage('Dados atualizados com sucesso!');
        setUpdateResult(response.data);
        
        setToast({
          message: response.data.message,
          type: 'success'
        });
        setShowToast(true);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao atualizar dados:', error);
      setUpdateProgressStep(0);
      setUpdateProgressMessage('');
      setToast({
        message: error.response?.data?.error || 'Erro ao atualizar dados',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      setTimeout(() => {
        hideLoading();
        setIsUpdatingData(false);
        setUpdateProgressStep(0);
        setUpdateProgressMessage('');
        setUpdateStartTime(0);
      }, 1000);
    }
  };

  const handleAdicionarAtivoPrioritario = async () => {
    if (!novoAtivo.codigo) {
      setToast({
        message: 'O código do ativo é obrigatório',
        type: 'error'
      });
      setShowToast(true);
      return;
    }

    try {
      showLoading('Adicionando ativo prioritário...');
      await axios.post('http://localhost:5000/api/ativos-prioritarios', novoAtivo, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      setNovoAtivo({ codigo: '', descricao: '', ordem: 0 });
      await carregarAtivosPrioritarios();
      
      setToast({
        message: 'Ativo prioritário adicionado com sucesso!',
        type: 'success'
      });
      setShowToast(true);
    } catch (error: any) {
      console.error('Erro ao adicionar ativo prioritário:', error);
      setToast({
        message: error.response?.data?.error || 'Erro ao adicionar ativo prioritário',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      hideLoading();
    }
  };

  const handleAtualizarAtivoPrioritario = async (id: number) => {
    const ativoParaAtualizar = ativosPrioritarios.find(ativo => ativo.id === id);
    if (!ativoParaAtualizar) return;

    try {
      showLoading('Atualizando ativo prioritário...');
      await axios.put(`http://localhost:5000/api/ativos-prioritarios/${id}`, ativoParaAtualizar, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      setModoEdicao(null);
      await carregarAtivosPrioritarios();
      
      setToast({
        message: 'Ativo prioritário atualizado com sucesso!',
        type: 'success'
      });
      setShowToast(true);
    } catch (error: any) {
      console.error('Erro ao atualizar ativo prioritário:', error);
      setToast({
        message: error.response?.data?.error || 'Erro ao atualizar ativo prioritário',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      hideLoading();
    }
  };

  const handleExcluirAtivoPrioritario = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este ativo prioritário?')) return;

    try {
      showLoading('Excluindo ativo prioritário...');
      await axios.delete(`http://localhost:5000/api/ativos-prioritarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      await carregarAtivosPrioritarios();
      
      setToast({
        message: 'Ativo prioritário excluído com sucesso!',
        type: 'success'
      });
      setShowToast(true);
    } catch (error: any) {
      console.error('Erro ao excluir ativo prioritário:', error);
      setToast({
        message: error.response?.data?.error || 'Erro ao excluir ativo prioritário',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      hideLoading();
    }
  };

  const handleMoverAtivo = async (id: number, direcao: 'cima' | 'baixo') => {
    const index = ativosPrioritarios.findIndex(ativo => ativo.id === id);
    if (index === -1) return;

    // Se estiver tentando mover para cima o primeiro item ou para baixo o último item
    if ((direcao === 'cima' && index === 0) || 
        (direcao === 'baixo' && index === ativosPrioritarios.length - 1)) {
      return;
    }

    const novosAtivos = [...ativosPrioritarios];
    const targetIndex = direcao === 'cima' ? index - 1 : index + 1;
    
    // Trocar posições
    [novosAtivos[index], novosAtivos[targetIndex]] = [novosAtivos[targetIndex], novosAtivos[index]];
    
    // Atualizar ordens
    const ativosAtualizados = novosAtivos.map((ativo, idx) => ({
      ...ativo,
      ordem: idx + 1
    }));
    
    setAtivosPrioritarios(ativosAtualizados);
    
    try {
      showLoading('Atualizando ordem...');
      await axios.put('http://localhost:5000/api/ativos-prioritarios/reordenar', {
        ativos: ativosAtualizados.map(ativo => ({ id: ativo.id, ordem: ativo.ordem }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
    } catch (error: any) {
      console.error('Erro ao reordenar ativos:', error);
      await carregarAtivosPrioritarios(); // Recarregar em caso de erro
      
      setToast({
        message: error.response?.data?.error || 'Erro ao reordenar ativos',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      hideLoading();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id?: number) => {
    const { name, value } = e.target;
    
    if (id) {
      // Editar ativo existente
      setAtivosPrioritarios(prev => 
        prev.map(ativo => 
          ativo.id === id ? { ...ativo, [name]: value } : ativo
        )
      );
    } else {
      // Novo ativo
      setNovoAtivo(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className={`dados-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={true}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h1>Dados e Integração</h1>

        <div className="dados-container">
          <CustomCard 
            className="portfolio-card" 
            isDarkMode={isDarkMode}
            title="Gerar Portfólio no Comdinheiro"
          >
            <div className="portfolio-form">
              <div className="form-group">
                <label>Nome do Portfólio:</label>
                <div className="portfolio-name-display">
                  <strong>ativos_Research</strong>
                  <span className="portfolio-name-note">(Nome base do portfólio)</span>
                </div>
                <div className="portfolio-info-note">
                  <i className="info-icon">ℹ️</i>
                  <span>Portfólios são limitados a 900 ativos cada. Se houver mais ativos, serão criados múltiplos portfólios (ativos_Research, ativos_Research1, etc).</span>
                </div>
              </div>
              
              <div className="form-actions">
                <CustomButton 
                  onClick={handleGerarPortfolio}
                  className={`btn-primary ${isGenerating ? 'btn-loading' : ''}`}
                  isDarkMode={isDarkMode}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner"></span>
                      Gerando...
                    </>
                  ) : (
                    'Gerar Portfólio'
                  )}
                </CustomButton>
                
                <CustomButton 
                  onClick={handleAtualizarDados}
                  className={`btn-secondary ${isUpdatingData ? 'btn-loading' : ''}`}
                  isDarkMode={isDarkMode}
                  disabled={isUpdatingData}
                >
                  {isUpdatingData ? (
                    <>
                      <span className="spinner"></span>
                      Atualizando...
                    </>
                  ) : (
                    'Atualizar Dados'
                  )}
                </CustomButton>
              </div>

              {isGenerating && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressStep * 25}%` }}
                    ></div>
                  </div>
                  <div className="progress-message">
                    {progressMessage}
                    <span className="elapsed-time">
                      {elapsedTime > 0 ? ` (${elapsedTime}s)` : ''}
                    </span>
                  </div>
                  <div className="progress-steps">
                    <div className={`step ${progressStep >= 1 ? 'active' : ''}`}>Conectando</div>
                    <div className={`step ${progressStep >= 2 ? 'active' : ''}`}>Buscando ativos</div>
                    <div className={`step ${progressStep >= 3 ? 'active' : ''}`}>Processando</div>
                    <div className={`step ${progressStep >= 4 ? 'active' : ''}`}>Concluído</div>
                  </div>
                </div>
              )}

              {isUpdatingData && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${updateProgressStep * 20}%` }}
                    ></div>
                  </div>
                  <div className="progress-message">
                    {updateProgressMessage}
                    <span className="elapsed-time">
                      {updateElapsedTime > 0 ? ` (${updateElapsedTime}s)` : ''}
                    </span>
                  </div>
                  <div className="progress-steps">
                    <div className={`step ${updateProgressStep >= 1 ? 'active' : ''}`}>Conectando</div>
                    <div className={`step ${updateProgressStep >= 2 ? 'active' : ''}`}>Testando</div>
                    <div className={`step ${updateProgressStep >= 3 ? 'active' : ''}`}>Buscando</div>
                    <div className={`step ${updateProgressStep >= 4 ? 'active' : ''}`}>Salvando</div>
                    <div className={`step ${updateProgressStep >= 5 ? 'active' : ''}`}>Concluído</div>
                  </div>
                </div>
              )}
            </div>

            {resultadoApi && (
              <div className="resultado-api">
                <h3>Resultado da Operação</h3>
                <div className="resultado-detalhes">
                  {resultadoApi.portfolios && resultadoApi.portfolios.length > 0 ? (
                    <>
                      <p><strong>Quantidade Total de Ativos:</strong> {resultadoApi.quantidade_total_ativos}</p>
                      <p><strong>Portfólios Gerados:</strong> {resultadoApi.portfolios.length}</p>
                      <p><strong>Status:</strong> {resultadoApi.message ? 'Sucesso' : 'Erro'}</p>
                      
                      <div className="portfolios-table">
                        <h4>Portfólios Criados</h4>
                        <table className={isDarkMode ? 'dark-mode' : ''}>
                          <thead>
                            <tr>
                              <th>Nome do Portfólio</th>
                              <th>Quantidade de Ativos</th>
                              <th>Limite</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultadoApi.portfolios.map((portfolio: Portfolio, index: number) => (
                              <tr key={index}>
                                <td>{portfolio.nome_portfolio}</td>
                                <td>{portfolio.quantidade_ativos}</td>
                                <td>{resultadoApi.detalhes_distribuicao?.[index]?.limite_maximo || 900}</td>
                                <td>
                                  {portfolio.resposta_api?.status === "ok" ? "Sucesso" : "Verificar"}
                                  {resultadoApi.detalhes_distribuicao?.[index]?.dentro_limite === false && 
                                    <span className="warning-badge">Limite excedido</span>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Nome do Portfólio:</strong> {resultadoApi.nome_portfolio}</p>
                      <p><strong>Quantidade de Ativos:</strong> {resultadoApi.quantidade_ativos}</p>
                      <p><strong>Status:</strong> {resultadoApi.message ? 'Sucesso' : 'Erro'}</p>
                    </>
                  )}
                  
                  {resultadoApi.estatisticas && (
                    <div className="estatisticas-detalhadas">
                      <h4>Estatísticas Detalhadas</h4>
                      <ul>
                        <li><strong>Ativos encontrados no banco:</strong> {resultadoApi.estatisticas.total_ativos_encontrados}</li>
                        <li><strong>Ativos incluídos no portfólio:</strong> {resultadoApi.estatisticas.total_portfolio}</li>
                        <li><strong>Ativos prioritários:</strong> {resultadoApi.estatisticas.ativos_prioritarios}</li>
                        <li><strong>CRI/CDCA/CRA (prefixo CETIP_):</strong> {resultadoApi.estatisticas.ativos_cri_cdca_cra}</li>
                        <li><strong>DEB (prefixo DEB:):</strong> {resultadoApi.estatisticas.ativos_deb}</li>
                        <li><strong>Outros (sem prefixo):</strong> {resultadoApi.estatisticas.ativos_outros}</li>
                        
                        {resultadoApi.estatisticas.status && (
                          <li className="status-stats">
                            <strong>Por status:</strong>
                            <ul className="status-list">
                              {Object.entries(resultadoApi.estatisticas.status).map(([status, count]: [string, number]) => (
                                <li key={status}>
                                  <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                                    {status}
                                  </span>
                                  <span>{count}</span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {updateResult && (
              <div className="resultado-api">
                <h3>Resultado da Atualização de Dados</h3>
                <div className="resultado-detalhes">
                  <p><strong>Mensagem:</strong> {updateResult.message}</p>
                  <p><strong>Ativos Processados:</strong> {updateResult.ativos_processados}</p>
                  <p><strong>Portfólios Processados:</strong> {updateResult.portfolios_processados?.length || 0}</p>
                  <p><strong>Período:</strong> {updateResult.data_inicial} a {updateResult.data_final}</p>
                  
                  {updateResult.portfolios_processados && updateResult.portfolios_processados.length > 0 && (
                    <div className="portfolios-processados">
                      <h4>Portfólios Atualizados:</h4>
                      <ul>
                        {updateResult.portfolios_processados.map((portfolio: string, index: number) => (
                          <li key={index} className="portfolio-item">
                            <span className="portfolio-badge">{portfolio}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {updateResult.erros && updateResult.erros.length > 0 && (
                    <div className="erros-atualizacao">
                      <h4>Erros Encontrados:</h4>
                      <ul>
                        {updateResult.erros.map((erro: string, index: number) => (
                          <li key={index} className="erro-item">{erro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CustomCard>

          <CustomCard 
            className="ativos-prioritarios-card" 
            isDarkMode={isDarkMode}
            title="Ativos Prioritários"
          >
            <div className="ativos-prioritarios-info">
              <p>Ativos listados aqui serão incluídos no início do portfólio gerado, na ordem especificada.</p>
            </div>

            <div className="ativos-prioritarios-list">
              <h3>Lista de Ativos Prioritários</h3>
              
              {ativosPrioritarios.length === 0 ? (
                <p className="no-data">Nenhum ativo prioritário cadastrado.</p>
              ) : (
                <div className="ativos-table">
                  <table className={isDarkMode ? 'dark-mode' : ''}>
                    <thead>
                      <tr>
                        <th>Ordem</th>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ativosPrioritarios.map((ativo) => (
                        <tr key={ativo.id}>
                          <td>{ativo.ordem}</td>
                          <td>
                            {modoEdicao === ativo.id ? (
                              <CustomInput
                                type="text"
                                name="codigo"
                                value={ativo.codigo}
                                onChange={(e) => handleInputChange(e, ativo.id)}
                                isDarkMode={isDarkMode}
                              />
                            ) : (
                              ativo.codigo
                            )}
                          </td>
                          <td>
                            {modoEdicao === ativo.id ? (
                              <CustomInput
                                type="text"
                                name="descricao"
                                value={ativo.descricao}
                                onChange={(e) => handleInputChange(e, ativo.id)}
                                isDarkMode={isDarkMode}
                              />
                            ) : (
                              ativo.descricao
                            )}
                          </td>
                          <td className="acoes-cell">
                            {modoEdicao === ativo.id ? (
                              <>
                                <CustomButton 
                                  onClick={() => handleAtualizarAtivoPrioritario(ativo.id!)}
                                  className="btn-small btn-success"
                                  isDarkMode={isDarkMode}
                                >
                                  Salvar
                                </CustomButton>
                                <CustomButton 
                                  onClick={() => setModoEdicao(null)}
                                  className="btn-small btn-secondary"
                                  isDarkMode={isDarkMode}
                                >
                                  Cancelar
                                </CustomButton>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="btn-icon" 
                                  onClick={() => handleMoverAtivo(ativo.id!, 'cima')}
                                  disabled={ativo.ordem === 1}
                                >
                                  ↑
                                </button>
                                <button 
                                  className="btn-icon" 
                                  onClick={() => handleMoverAtivo(ativo.id!, 'baixo')}
                                  disabled={ativo.ordem === ativosPrioritarios.length}
                                >
                                  ↓
                                </button>
                                <button 
                                  className="btn-icon edit" 
                                  onClick={() => setModoEdicao(ativo.id!)}
                                >
                                  ✎
                                </button>
                                <button 
                                  className="btn-icon delete" 
                                  onClick={() => handleExcluirAtivoPrioritario(ativo.id!)}
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="novo-ativo-form">
                <h4>Adicionar Novo Ativo Prioritário</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Código:</label>
                    <CustomInput
                      type="text"
                      name="codigo"
                      value={novoAtivo.codigo}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="Ex: PETR4"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Descrição:</label>
                    <CustomInput
                      type="text"
                      name="descricao"
                      value={novoAtivo.descricao}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="Descrição (opcional)"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="form-actions">
                    <CustomButton 
                      onClick={handleAdicionarAtivoPrioritario}
                      className="btn-primary"
                      isDarkMode={isDarkMode}
                    >
                      Adicionar
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          </CustomCard>
        </div>
      </div>

      {showToast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Dados; 