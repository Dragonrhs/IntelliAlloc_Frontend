import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './ClientsList.css';

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/clients', {
          withCredentials: true,
        });
        setClients(response.data.clients);
      } catch (error: any) {
        console.error('Erro ao listar clientes:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao listar clientes');
      }
    };
    fetchClients();
  }, []);

  const handleEditClient = (clientId: number) => {
    navigate(`/suitability/${clientId}`);
  };

  const handleViewClient = (clientId: number) => {
    navigate(`/client/${clientId}`);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        setClients(clients.filter((client) => client.id !== clientId));
        alert('Cliente excluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        alert(error.response?.data?.error || 'Erro ao excluir cliente');
      }
    }
  };

  const handleAddClient = () => {
    navigate('/suitability');
  };

  return (
    <div className={`clients-list-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      <div className="clients-list-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Lista de Clientes</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {clients.length === 0 ? (
          <p>Nenhum cliente cadastrado.</p>
        ) : (
          <>
            <ul>
              {clients.map((client) => (
                <li key={client.id}>
                  <span>{client.client_name} ({client.risk_profile || 'Não definido'})</span>
                  <div className="client-actions">
                    <button onClick={() => handleViewClient(client.id)}>👁️</button>
                    <button onClick={() => handleEditClient(client.id)}>✏️</button>
                    <button onClick={() => handleDeleteClient(client.id)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="add-client-button"
              onClick={handleAddClient}
              style={{ marginTop: '20px' }}
            >
              ➕
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientsList;