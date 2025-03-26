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
      navigate('/');
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
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className="register-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <h2>Registrar</h2>
        <CustomCard className="register-card" isDarkMode={isDarkMode}>
          <CustomInput
            type="text"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            label="Usuário"
            className="input-neon"
            isDarkMode={isDarkMode}
          />
          <CustomInput
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="E-mail"
            className="input-neon"
            isDarkMode={isDarkMode}
          />
          <CustomInput
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Senha"
            isDarkMode={isDarkMode}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <CustomButton
            text="Registrar"
            onClick={handleRegister}
            className="login-button"
            isDarkMode={isDarkMode}
          />
          <CustomButton
            text="Voltar"
            onClick={() => navigate('/')}
            className="login-button secondary"
            isDarkMode={isDarkMode}
          />
        </CustomCard>
      </div>
    </div>
  );
};

export default Register;