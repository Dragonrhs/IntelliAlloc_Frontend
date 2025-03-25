import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './History.css';

const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/history', {
          withCredentials: true,
        });
        setHistory(response.data.history);
      } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao buscar histórico');
      }
    };
    fetchHistory();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

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
        <h2>Histórico de Ações</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {history.length === 0 ? (
          <p>Nenhuma ação registrada.</p>
        ) : (
          <ul>
            {history.map((action) => (
              <li key={action.id}>
                <strong>
                  {action.action_type === 'INSERT' ? 'Inserção' : action.action_type === 'UPDATE' ? 'Edição' : 'Exclusão'}
                </strong>{' '}
                - {action.details} - {new Date(action.action_date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;