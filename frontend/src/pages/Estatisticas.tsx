import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faUserShield,
  faChartPie,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faDatabase,
  faCalendarAlt,
  faChartBar,
  faUserTie,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CustomCard from '../components/CustomCard';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Estatisticas.css';

interface Usuario {
  id_usuario: number;
  nome_usuario: string;
  quantidade_clientes: number;
}

interface PerfilRisco {
  perfil_risco: string;
  quantidade_clientes: number;
}

interface ClientesTempo {
  data: string;
  quantidade: number;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const Estatisticas: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfilRisco, setPerfilRisco] = useState<PerfilRisco[]>([]);
  const [clientesTempo, setClientesTempo] = useState<ClientesTempo[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await carregarEstatisticasGerais();
        setToastMessage('Estatísticas carregadas com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        console.error('Erro ao carregar estatísticas:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao carregar estatísticas');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const carregarEstatisticasGerais = async () => {
    try {
      // Buscar estatísticas de usuários
      const usuariosResponse = await axios.get('http://localhost:5000/api/estatisticas/usuarios', {
        withCredentials: true
      });
      setUsuarios(usuariosResponse.data.estatisticas);

      // Buscar estatísticas de perfil de risco
      const perfilResponse = await axios.get('http://localhost:5000/api/estatisticas/perfil_risco', {
        withCredentials: true
      });
      setPerfilRisco(perfilResponse.data.estatisticas);

      // Buscar estatísticas de evolução temporal
      const tempoResponse = await axios.get('http://localhost:5000/api/estatisticas/clientes-tempo', {
        withCredentials: true
      });
      setClientesTempo(tempoResponse.data.estatisticas);

      setPerfilSelecionado(null);
      setUsuarioSelecionado(null);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas gerais:', error);
      throw error;
    }
  };

  const handleUsuarioClick = async (userId: number) => {
    setUsuarioSelecionado(userId);
    setPerfilSelecionado(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/estatisticas/perfil_risco?id_usuario=${userId}`, {
        withCredentials: true
      });
      setPerfilRisco(response.data.estatisticas);

      // Buscar estatísticas temporais do usuário específico
      const tempoResponse = await axios.get(`http://localhost:5000/api/estatisticas/clientes-tempo?id_usuario=${userId}`, {
        withCredentials: true
      });
      setClientesTempo(tempoResponse.data.estatisticas);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas do usuário:', error);
      setToastMessage(error.response?.data?.error || 'Erro ao carregar estatísticas do usuário');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handlePerfilClick = async (perfil: string) => {
    if (!perfil) return;
    
    setPerfilSelecionado(perfil);
    setUsuarioSelecionado(null);
    try {
      // Buscar usuários com a quantidade de clientes do perfil específico
      const response = await axios.get(`http://localhost:5000/api/estatisticas/usuarios/por-perfil/${perfil}`, {
        withCredentials: true
      });
      setUsuarios(response.data.estatisticas);

      // Buscar estatísticas temporais do perfil específico
      const tempoResponse = await axios.get(`http://localhost:5000/api/estatisticas/clientes-tempo?perfil=${perfil}`, {
        withCredentials: true
      });
      setClientesTempo(tempoResponse.data.estatisticas);
    } catch (error: any) {
      console.error('Erro ao carregar usuários por perfil:', error);
      setToastMessage(error.response?.data?.error || 'Erro ao carregar usuários por perfil');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleResetClick = async () => {
    try {
      setIsLoading(true);
      await carregarEstatisticasGerais();
      setToastMessage('Visão geral restaurada!');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage('Erro ao restaurar visão geral');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    const totalUsuarios = usuarios.length;
    const totalClientes = usuarios.reduce((sum, user) => sum + user.quantidade_clientes, 0);
    const totalPerfis = perfilRisco.length;
    const mediaClientesPorUsuario = totalUsuarios > 0 ? (totalClientes / totalUsuarios).toFixed(1) : '0';

    return [
      { 
        label: 'Total de Usuários', 
        value: totalUsuarios, 
        icon: faUsers, 
        color: '#667eea',
        description: 'Usuários ativos no sistema'
      },
      { 
        label: 'Total de Clientes', 
        value: totalClientes, 
        icon: faUserTie, 
        color: '#764ba2',
        description: 'Clientes cadastrados'
      },
      { 
        label: 'Perfis de Risco', 
        value: totalPerfis, 
        icon: faShieldAlt, 
        color: '#f093fb',
        description: 'Tipos de perfil disponíveis'
      },
      { 
        label: 'Média por Usuário', 
        value: mediaClientesPorUsuario, 
        icon: faChartBar, 
        color: '#4facfe',
        description: 'Clientes por usuário'
      }
    ];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`estatisticas-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`estatisticas-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="estatisticas-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="estatisticas-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faChartLine} className="header-icon" />
              <h1>Estatísticas do Sistema</h1>
            </div>
            <p>Análise completa de usuários, clientes e perfis de risco</p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="stats-section">
          <div className="stats-grid">
            {getStats().map((stat, index) => (
              <CustomCard key={index} className="stat-card" isDarkMode={isDarkMode}>
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-description">{stat.description}</p>
                </div>
              </CustomCard>
            ))}
          </div>
        </div>

        {/* Gráfico de Evolução Temporal */}
        <CustomCard className="evolution-card" isDarkMode={isDarkMode}>
          <div className="card-header">
            <div className="header-info">
              <FontAwesomeIcon icon={faChartLine} className="card-icon" />
              <h2>
                {usuarioSelecionado 
                  ? `Evolução - ${usuarios.find(u => u.id_usuario === usuarioSelecionado)?.nome_usuario}`
                  : perfilSelecionado
                    ? `Evolução - Perfil ${perfilSelecionado}`
                    : 'Evolução do Número de Clientes'}
              </h2>
            </div>
            {(perfilSelecionado || usuarioSelecionado) && (
              <button onClick={handleResetClick} className="reset-button">
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Voltar para Visão Geral</span>
              </button>
            )}
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientesTempo}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey="data" 
                  stroke={isDarkMode ? '#fff' : '#333'}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatDate}
                />
                <YAxis 
                  stroke={isDarkMode ? '#fff' : '#333'}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  labelFormatter={formatDate}
                />
                <Line 
                  type="monotone" 
                  dataKey="quantidade" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
                  name="Número de Clientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CustomCard>

        {/* Grid de Gráficos */}
        <div className="charts-grid">
          {/* Tabela de Usuários */}
          <CustomCard className="users-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <div className="header-info">
                <FontAwesomeIcon icon={faUsers} className="card-icon" />
                <h2>
                  {perfilSelecionado 
                    ? `Usuários com Clientes ${perfilSelecionado}s`
                    : 'Usuários e Quantidade de Clientes'}
                </h2>
              </div>
            </div>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Quantidade de Clientes</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr 
                      key={usuario.id_usuario}
                      onClick={() => handleUsuarioClick(usuario.id_usuario)}
                      className={usuarioSelecionado === usuario.id_usuario ? 'selected' : ''}
                    >
                      <td>
                        <div className="user-info">
                          <FontAwesomeIcon icon={faUserTie} />
                          <span>{usuario.nome_usuario}</span>
                        </div>
                      </td>
                      <td>
                        <span className="client-count">{usuario.quantidade_clientes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CustomCard>

          {/* Gráfico de Pizza */}
          <CustomCard className="pie-chart-card" isDarkMode={isDarkMode}>
            <div className="card-header">
              <div className="header-info">
                <FontAwesomeIcon icon={faChartPie} className="card-icon" />
                <h2>
                  {usuarioSelecionado 
                    ? 'Distribuição por Perfil de Risco'
                    : 'Distribuição por Perfil de Risco'}
                </h2>
              </div>
            </div>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={perfilRisco}
                    dataKey="quantidade_clientes"
                    nameKey="perfil_risco"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ perfil_risco, quantidade_clientes }) => `${perfil_risco}: ${quantidade_clientes}`}
                    onClick={(data) => handlePerfilClick(data.perfil_risco)}
                    cursor="pointer"
                  >
                    {perfilRisco.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        opacity={perfilSelecionado && perfilSelecionado !== entry.perfil_risco ? 0.5 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    onClick={(entry) => handlePerfilClick(entry.value)}
                    wrapperStyle={{
                      color: isDarkMode ? '#fff' : '#333',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>
        </div>
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

export default Estatisticas; 