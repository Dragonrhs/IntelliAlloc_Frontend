import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './History.css'; // Reutilizando o CSS do History por simplicidade

const SystemHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const fetchSystemHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/system-history', {
          withCredentials: true,
        });
        console.log('Histórico do sistema:', response.data.history); // Log para depuração
        setHistory(response.data.history);
      } catch (error: any) {
        console.error('Erro ao buscar histórico do sistema:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao buscar histórico do sistema');
      }
    };
    fetchSystemHistory();
  }, []);

  return (
    <div className={`history-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      <div className="history-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Histórico do Sistema</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {history.length === 0 ? (
          <p>Nenhuma ação registrada no sistema.</p>
        ) : (
          <ul>
            {history.map((action) => (
              <li key={action.id}>
                <strong>{action.username || 'Usuário desconhecido'}</strong> fez{' '}
                {action.action_type === 'INSERT'
                  ? 'Inserção'
                  : action.action_type === 'UPDATE'
                  ? 'Edição'
                  : 'Exclusão'}{' '}
                - {action.details || 'Detalhes indisponíveis'} -{' '}
                {action.action_date
                  ? new Date(action.action_date).toLocaleString()
                  : 'Data indisponível'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SystemHistory;