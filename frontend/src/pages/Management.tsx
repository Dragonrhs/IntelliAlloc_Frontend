import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './Management.css';

interface User {
  id: number;
  username: string;
  email: string;
  cargo_id: number;
  cargo_nome: string;
}

interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar usuários
        const usersResponse = await axios.get('http://localhost:5000/users', {
          withCredentials: true,
        });
        setUsers(usersResponse.data);
        
        // Buscar cargos
        const cargosResponse = await axios.get('http://localhost:5000/cargos', {
          withCredentials: true,
        });
        setCargos(cargosResponse.data);
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        setErrorMessage(error.response?.data?.error || 'Erro ao buscar dados');
      }
    };
    fetchData();
  }, []);

  const handleCargoChange = async (userId: number, newCargoId: number) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/users/${userId}/role`,
        { cargo_id: newCargoId },
        { withCredentials: true }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { 
          ...user, 
          cargo_id: newCargoId,
          cargo_nome: cargos.find(c => c.id === newCargoId)?.nome || user.cargo_nome
        } : user
      ));
      
      setSuccessMessage('Cargo atualizado com sucesso');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao atualizar cargo');
      setTimeout(() => setErrorMessage(''), 5000);
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
        {successMessage && <p className="success-message">{successMessage}</p>}
        {users.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <table className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className={`role-select ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
                      value={user.cargo_id}
                      onChange={(e) => handleCargoChange(user.id, parseInt(e.target.value, 10))}
                    >
                      {cargos.map(cargo => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nome}
                        </option>
                      ))}
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