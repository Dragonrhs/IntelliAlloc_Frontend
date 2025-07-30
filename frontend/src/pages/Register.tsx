import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar'; // Importar o novo componente Navbar
import { useTheme } from '../context/ThemeContext';
import './Register.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleRegister = async () => {
    setErrorMessage('');
    try {
      await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
      });
      alert('Registro realizado com sucesso! Faça login.');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao registrar');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className={`register-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <div className="register-content">
        <div className="theme-toggle-container">
          <button 
            className={`theme-toggle-button ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            onClick={toggleTheme}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <h2>Registrar</h2>
        <CustomCard className="register-card" isDarkMode={isDarkMode}>
          <div className="input-group">
            <label htmlFor="username">Usuário</label>
            <CustomInput
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <CustomInput
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <CustomInput
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-neon"
              isDarkMode={isDarkMode}
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <CustomButton
            onClick={handleRegister}
            className="login-button"
            isDarkMode={isDarkMode}
          >
            Registrar
          </CustomButton>
          <CustomButton
            onClick={() => navigate('/login')}
            className="login-button secondary"
            isDarkMode={isDarkMode}
          >
            Voltar
          </CustomButton>
        </CustomCard>
      </div>
    </div>
  );
};

export default Register;