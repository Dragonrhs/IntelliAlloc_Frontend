import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './Management.css';

const Management: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users', {
          withCredentials: true,
        });
        setUsers(response.data.users);
      } catch (error: any) {
        console.error('Erro ao buscar usuários:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao buscar usuários');
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(
        `http://localhost:5000/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao atualizar role');
    }
  };

  return (
    <div className={`management-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      <div className={`management-content ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Gerenciamento de Usuários</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {users.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <table className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <select
                      className={`role-select ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="PS">PS</option>
                      <option value="Alocacao">Alocacao</option>
                      <option value="Research">Research</option>
                      <option value="Membro">Membro</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Management;