import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'login' | 'request' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, setRole } = useTheme();

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { username, password },
        { withCredentials: true }
      );
      setRole(response.data.role);  

      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Usuário ou senha incorretos.');
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/request-password-reset', { email });
      setErrorMessage(response.data.message);
      setResetStep('verify');
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao solicitar redefinição');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/reset-password', {
        email,
        token,
        new_password: newPassword,
      });
      setErrorMessage(response.data.message);
      setTimeout(() => {
        setResetStep('login');
        setEmail('');
        setToken('');
        setNewPassword('');
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      setErrorMessage(error.response?.data?.error || 'Erro ao redefinir senha');
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className={`login-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <div className="login-content">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : (
          <div className="login-form">
            <div className="theme-toggle-container">
              <button 
                className={`theme-toggle-button ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
                onClick={toggleTheme}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            <h2 className="login-title">
              {resetStep === 'login' ? 'Faça seu login' : resetStep === 'request' ? 'Redefinir Senha' : 'Verificar Código'}
            </h2>
            <CustomCard className="login-card" isDarkMode={isDarkMode}>
              {resetStep === 'login' ? (
                <>
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
                </>
              ) : resetStep === 'request' ? (
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
              ) : (
                <>
                  <div className="input-group">
                    <label htmlFor="token">Código</label>
                    <CustomInput
                      id="token"
                      type="text"
                      placeholder="Digite o código recebido"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="input-neon"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="newPassword">Nova Senha</label>
                    <CustomInput
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-neon"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </>
              )}
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="button-group">
                <CustomButton
                  onClick={resetStep === 'login' ? handleLogin : resetStep === 'request' ? handleRequestReset : handleResetPassword}
                  className="login-button"
                  isDarkMode={isDarkMode}
                >
                  {resetStep === 'login' ? 'Entrar' : resetStep === 'request' ? 'Enviar Código' : 'Redefinir Senha'}
                </CustomButton>
                {resetStep !== 'login' && (
                  <CustomButton
                    onClick={() => setResetStep(resetStep === 'verify' ? 'request' : 'login')}
                    className="login-button secondary"
                    isDarkMode={isDarkMode}
                  >
                    Voltar
                  </CustomButton>
                )}
              </div>
              {resetStep === 'login' && (
                <div className="login-links">
                  <p className="register-text">
                    Ainda não tem uma conta?{' '}
                    <a href="#" className="register-link" onClick={handleRegisterRedirect}>
                      Criar conta
                    </a>
                  </p>
                  <p className="forgot-password-text">
                    <a
                      href="#"
                      className="forgot-password-link"
                      onClick={() => setResetStep('request')}
                    >
                      Esqueci minha senha
                    </a>
                  </p>
                </div>
              )}
            </CustomCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;