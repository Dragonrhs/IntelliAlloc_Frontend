import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
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

const COLORS = ['#354864', '#7894ba', '#bcc9dc'];

const Estatisticas: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfilRisco, setPerfilRisco] = useState<PerfilRisco[]>([]);
  const [clientesTempo, setClientesTempo] = useState<ClientesTempo[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Apenas carregar estatísticas, sem redirecionar
        await carregarEstatisticasGerais();
      } catch (error: any) {
        console.error('Erro ao carregar estatísticas:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao carregar estatísticas');
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
      setErrorMessage(error.response?.data?.error || 'Erro ao carregar estatísticas gerais');
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
      setErrorMessage(error.response?.data?.error || 'Erro ao carregar estatísticas do usuário');
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
      setErrorMessage(error.response?.data?.error || 'Erro ao carregar usuários por perfil');
    }
  };

  const handleResetClick = () => {
    carregarEstatisticasGerais();
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      <div className="estatisticas-container">
        <div className="estatisticas-card">
          <h2 className="estatisticas-titulo">
            {usuarioSelecionado 
              ? `Evolução do Número de Clientes - ${usuarios.find(u => u.id_usuario === usuarioSelecionado)?.nome_usuario}`
              : perfilSelecionado
                ? `Evolução do Número de Clientes - Perfil ${perfilSelecionado}`
                : 'Evolução do Número de Clientes'}
          </h2>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientesTempo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data" 
                  stroke={isDarkMode ? '#fff' : '#000'}
                />
                <YAxis 
                  stroke={isDarkMode ? '#fff' : '#000'}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="quantidade" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Número de Clientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="graficos-grid">
          <div className="estatisticas-card">
            <div className="card-header">
              <h2 className="estatisticas-titulo">
                {perfilSelecionado 
                  ? `Usuários com Clientes ${perfilSelecionado}s`
                  : 'Usuários e Quantidade de Clientes'}
              </h2>
              {(perfilSelecionado || usuarioSelecionado) && (
                <button onClick={handleResetClick} className="reset-button">
                  Voltar para Visão Geral
                </button>
              )}
            </div>
            <table className="tabela-usuarios">
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
                    className={usuarioSelecionado === usuario.id_usuario ? 'selecionado' : ''}
                  >
                    <td>{usuario.nome_usuario}</td>
                    <td>{usuario.quantidade_clientes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="estatisticas-card">
            <h2 className="estatisticas-titulo">
              {usuarioSelecionado 
                ? 'Distribuição por Perfil de Risco do Usuário'
                : 'Distribuição por Perfil de Risco'}
            </h2>
            <div className="grafico-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={perfilRisco}
                    dataKey="quantidade_clientes"
                    nameKey="perfil_risco"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
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
                  <Tooltip />
                  <Legend onClick={(entry) => handlePerfilClick(entry.value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas; 