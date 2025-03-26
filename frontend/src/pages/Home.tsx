import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, role, setRole } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true,
        });
        setData(response.data);
        setEditUsername(response.data.message.split('Bem-vindo ')[1].replace('!', ''));
        setEditEmail(response.data.email);
        setRole(response.data.role); // Atualiza o role no ThemeContext
      } catch (error) {
        console.error('Erro ao acessar home:', error);
        navigate('/');
      }
    };
    fetchData();
  }, [navigate, setRole]);

  const handleEditClient = (clientId: number) => {
    navigate(`/suitability/${clientId}`);
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação também excluirá todos os seus clientes e não pode ser desfeita.')) {
      try {
        await axios.delete('http://localhost:5000/delete-user', {
          withCredentials: true,
        });
        alert('Conta excluída com sucesso!');
        navigate('/');
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        alert(error.response?.data?.error || 'Erro ao excluir usuário');
      }
    }
  };

  const handleUpdateUser = async () => {
    setErrorMessage('');
    try {
      const response = await axios.put(
        'http://localhost:5000/update-user',
        { username: editUsername, email: editEmail },
        { withCredentials: true }
      );
      alert(response.data.message);
      setShowEditForm(false);
      setData({
        ...data,
        message: `Bem-vindo ${editUsername}!`,
        email: editEmail,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao atualizar usuário');
    }
  };

  if (!data) return <div>Carregando...</div>;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar
        showAvatar={true}
        username={editUsername}
        email={editEmail}
        isDarkMode={isDarkMode}
        onEditProfile={() => setShowEditForm(true)}
        role={role} // Passa o role para a Navbar
      />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onAddClient={() => navigate('/suitability')}
        isFullSidebar={true}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {!showEditForm ? (
          <div className="user-info">
            <p>{data.message}</p>
            <p>Email: {data.email}</p>
            <p>Cargo: {role}</p> {/* Usa apenas role do ThemeContext */}
            <p>Criado em: {data.created_at}</p>
            <p>Último acesso: {data.last_access}</p>
          </div>
        ) : (
          <CustomCard className="edit-form-card">
            <h3>Editar Perfil</h3>
            <CustomInput
              type="text"
              placeholder="Digite seu novo username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              label="Username"
              className="input-neon"
            />
            <CustomInput
              type="email"
              placeholder="Digite seu novo e-mail"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              label="E-mail"
              className="input-neon"
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="edit-form-buttons">
              <CustomButton
                text="Salvar"
                onClick={handleUpdateUser}
                className="login-button"
              />
              <CustomButton
                text="Cancelar"
                onClick={() => setShowEditForm(false)}
                className="login-button secondary"
              />
              <CustomButton
                text="Excluir Usuário"
                onClick={handleDeleteUser}
                className="login-button delete"
              />
            </div>
          </CustomCard>
        )}
      </div>
    </div>
  );
};

export default Home;