import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, role, setRole } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true,
        });
        setData(response.data);
        const username = response.data.message.split('Bem-vindo ')[1].replace('!', '');
        setCurrentUsername(username);
        setCurrentEmail(response.data.email);
        setEditUsername(username);
        setEditEmail(response.data.email);
        setRole(response.data.role);
      } catch (error) {
        console.error('Erro ao acessar home:', error);
        navigate('/');
      }
    };
    fetchData();
  }, [navigate, setRole]);

  const handleDeleteUser = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação também excluirá todos os seus clientes e não pode ser desfeita.')) {
      try {
        await axios.delete('http://localhost:5000/delete-user', {
          withCredentials: true,
        });
        setToastMessage('Conta excluída com sucesso!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao excluir usuário');
        setToastType('error');
        setShowToast(true);
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
      setToastMessage(response.data.message);
      setToastType('success');
      setShowToast(true);
      setShowEditForm(false);
      setCurrentUsername(editUsername);
      setCurrentEmail(editEmail);
      setData({
        ...data,
        message: `Bem-vindo ${editUsername}!`,
        email: editEmail,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      setToastMessage(error.response?.data?.error || 'Erro ao atualizar usuário');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(currentUsername);
    setEditEmail(currentEmail);
    setShowEditForm(false);
    setErrorMessage('');
  };

  if (!data) return <div>Carregando...</div>;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar
        showAvatar={true}
        username={currentUsername}
        email={currentEmail}
        isDarkMode={isDarkMode}
        onEditProfile={() => setShowEditForm(true)}
        role={role}
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
            <p>Cargo: {role}</p>
            <p>Criado em: {data.created_at}</p>
            <p>Último acesso: {data.last_access}</p>
          </div>
        ) : (
          <CustomCard className="edit-form-card" isDarkMode={isDarkMode}>
            <h3>Editar Perfil</h3>
            <CustomInput
              type="text"
              placeholder="Digite seu nome de usuário"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
            <CustomInput
              type="email"
              placeholder="Digite seu e-mail"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="edit-form-buttons">
              <CustomButton
                onClick={handleUpdateUser}
                className="login-button"
                isDarkMode={isDarkMode}
              >
                Salvar
              </CustomButton>
              <CustomButton
                onClick={handleCancelEdit}
                className="login-button secondary"
                isDarkMode={isDarkMode}
              >
                Cancelar
              </CustomButton>
              <CustomButton
                onClick={handleDeleteUser}
                className="login-button delete"
                isDarkMode={isDarkMode}
              >
                Excluir Usuário
              </CustomButton>
            </div>
          </CustomCard>
        )}
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

export default Home;