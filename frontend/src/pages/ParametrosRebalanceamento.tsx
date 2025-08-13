import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSpinner, 
  faCog, 
  faCheckCircle, 
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ParametroModal from '../components/ParametroModal';
import CustomCard from '../components/CustomCard';
import CustomButton from '../components/CustomButton';
import Toast from '../components/Toast';
import './ParametrosRebalanceamento.css';

interface Parametro {
  id: number;
  nome_parametro: string;
  descricao: string;
  peso_padrao: number;
  ativo: boolean;
}

const ParametrosRebalanceamento: React.FC = () => {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingParametro, setEditingParametro] = useState<Parametro | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    carregarParametros();
  }, []);

  const carregarParametros = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/parametros', {
        withCredentials: true
      });
      setParametros(response.data.parametros);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
      setError('Erro ao carregar parâmetros. Por favor, tente novamente mais tarde.');
      setToastMessage('Erro ao carregar parâmetros');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionar = () => {
    setEditingParametro(null);
    setShowModal(true);
  };

  const handleEditar = (parametro: Parametro) => {
    setEditingParametro(parametro);
    setShowModal(true);
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este parâmetro?')) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/parametros/${id}`, {
          withCredentials: true
        });
        await carregarParametros();
        setToastMessage('Parâmetro excluído com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        console.error('Erro ao excluir parâmetro:', error);
        setToastMessage('Erro ao excluir parâmetro');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSalvar = async (parametro: Omit<Parametro, 'id'>) => {
    try {
      setIsLoading(true);
      if (editingParametro) {
        await axios.put(`http://localhost:5000/api/parametros/${editingParametro.id}`, parametro, {
          withCredentials: true
        });
        setToastMessage('Parâmetro atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:5000/api/parametros', parametro, {
          withCredentials: true
        });
        setToastMessage('Parâmetro adicionado com sucesso!');
      }
      setToastType('success');
      setShowToast(true);
      setShowModal(false);
      await carregarParametros();
    } catch (error) {
      console.error('Erro ao salvar parâmetro:', error);
      setToastMessage('Erro ao salvar parâmetro');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    const total = parametros.length;
    const ativos = parametros.filter(p => p.ativo).length;
    const inativos = total - ativos;
    const pesoMedio = total > 0 ? (parametros.reduce((sum, p) => sum + p.peso_padrao, 0) / total).toFixed(1) : '0.0';
    
    return [
      { label: 'Total', value: total, icon: faCog, color: '#4facfe' },
      { label: 'Ativos', value: ativos, icon: faCheckCircle, color: '#4caf50' },
      { label: 'Inativos', value: inativos, icon: faExclamationTriangle, color: '#f44336' },
      { label: 'Peso Médio', value: pesoMedio, icon: faInfoCircle, color: '#ff9800' }
    ];
  };

  if (loading) {
    return (
      <div 
        className={`parametros-rebalanceamento-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando parâmetros...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`parametros-rebalanceamento-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
        showBackButton={true}
      />
      
      <div className="parametros-rebalanceamento-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="evaluation-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faCog} className="header-icon" />
              <h1>Parâmetros de Rebalanceamento</h1>
            </div>
            <p>Gerencie os parâmetros utilizados para otimizar as carteiras de investimento</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-section">
          {getStats().map((stat, index) => (
            <CustomCard key={stat.label} className="stat-card" isDarkMode={isDarkMode}>
              <div className="stat-content" style={{ animationDelay: `${index * 0.1}s` }}>
                <FontAwesomeIcon 
                  icon={stat.icon} 
                  className="stat-icon" 
                  style={{ color: stat.color }}
                />
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            </CustomCard>
          ))}
        </div>

        {/* Ações */}
        <div className="actions-section">
          <CustomButton 
            onClick={handleAdicionar} 
            isDarkMode={isDarkMode}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faPlus} />
            Adicionar Parâmetro
          </CustomButton>
        </div>

        {/* Tabela */}
        <CustomCard className="table-card" isDarkMode={isDarkMode}>
          {error ? (
            <div className="error-container">
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
              <div className="error-content">
                <h3>Erro ao Carregar</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : parametros.length === 0 ? (
            <div className="empty-container">
              <FontAwesomeIcon icon={faCog} className="empty-icon" />
              <div className="empty-content">
                <h3>Nenhum Parâmetro Encontrado</h3>
                <p>Adicione seu primeiro parâmetro de rebalanceamento para começar</p>
              </div>
            </div>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome do Parâmetro</th>
                    <th>Descrição</th>
                    <th>Peso Padrão</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {parametros.map((parametro, index) => (
                    <tr key={parametro.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="parametro-nome">{parametro.nome_parametro}</td>
                      <td className="parametro-descricao">{parametro.descricao}</td>
                      <td className="parametro-peso">{parametro.peso_padrao}</td>
                      <td>
                        <span className={`status-badge ${parametro.ativo ? 'ativo' : 'inativo'}`}>
                          <FontAwesomeIcon icon={parametro.ativo ? faCheckCircle : faExclamationTriangle} />
                          {parametro.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="acoes">
                        <CustomButton
                          onClick={() => handleEditar(parametro)}
                          isDarkMode={isDarkMode}
                          className="edit-button"
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </CustomButton>
                        <CustomButton
                          onClick={() => handleExcluir(parametro.id)}
                          isDarkMode={isDarkMode}
                          className="delete-button"
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </CustomButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CustomCard>

        {showModal && (
          <ParametroModal
            parametro={editingParametro}
            onClose={() => setShowModal(false)}
            onSave={handleSalvar}
            isDarkMode={isDarkMode}
          />
        )}

        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ParametrosRebalanceamento; 