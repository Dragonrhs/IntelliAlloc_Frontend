import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faCrown,
  faCalendarAlt,
  faClock,
  faUsers,
  faChartBar,
  faBriefcase,
  faCog,
  faHistory,
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faUserCog,
  faShieldAlt,
  faBell,
  faStar,
  faTrophy,
  faChartLine,
  faDatabase,
  faFileAlt,
  faToggleOn,
  faToggleOff,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
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
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, toggleBackgroundAnimation } = useTheme();
  const { userRole, user } = useUser();

  // Dados de atalhos baseados no cargo do usuário
  const getShortcuts = () => {
    const baseShortcuts = [
      { icon: faUsers, label: 'Clientes', path: '/clients', color: '#667eea' },
      { icon: faPlus, label: 'Novo Cliente', path: '/suitability', color: '#4facfe' },
      { icon: faSearch, label: 'Consultar Ativos', path: '/consultar-ativos', color: '#43e97b' },
      { icon: faHistory, label: 'Histórico', path: '/history', color: '#f093fb' }
    ];

    if (userRole === 'Admin') {
      return [
        ...baseShortcuts,
        { icon: faCog, label: 'Gerenciamento', path: '/management', color: '#ff6b6b' },
        { icon: faShieldAlt, label: 'Permissões', path: '/permissions', color: '#feca57' },
        { icon: faDatabase, label: 'Dados', path: '/dados', color: '#48dbfb' },
        { icon: faChartBar, label: 'Estatísticas', path: '/estatisticas', color: '#ff9ff3' }
      ];
    }

    if (userRole === 'Gerente') {
      return [
        ...baseShortcuts,
        { icon: faBriefcase, label: 'Carteiras', path: '/view-recommended-portfolio', color: '#ff6b6b' },
        { icon: faChartLine, label: 'Avaliações', path: '/asset-class-evaluation', color: '#feca57' },
        { icon: faFileAlt, label: 'Relatórios', path: '/visualizacao-dados', color: '#48dbfb' }
      ];
    }

    return baseShortcuts;
  };

  // Estatísticas simuladas do usuário
  const getUserStats = () => {
    return [
      { icon: faUsers, label: 'Clientes Ativos', value: '12', color: '#667eea' },
      { icon: faBriefcase, label: 'Carteiras', value: '8', color: '#4facfe' },
      { icon: faChartBar, label: 'Avaliações', value: '24', color: '#43e97b' },
      { icon: faHistory, label: 'Atividades', value: '156', color: '#f093fb' }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true
        });
        
        console.log('Dados do usuário:', response.data);
        
        setData(response.data);
        
        let username = '';
        if (response.data.message && response.data.message.includes('Bem-vindo ')) {
          username = response.data.message.split('Bem-vindo ')[1].replace('!', '');
        }
        
        setCurrentUsername(username || '');
        setCurrentEmail(response.data.email || '');
        setEditUsername(username || '');
        setEditEmail(response.data.email || '');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchData();
  }, []);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!data) return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : ''}`}>
      <Navbar
        showAvatar={true}
        username={currentUsername}
        email={currentEmail}
        isDarkMode={isDarkMode}
        onEditProfile={() => setShowEditForm(true)}
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
          <div className="home-content">
            {/* Header com boas-vindas */}
            <div className="welcome-header">
              <div className="welcome-text">
                <h1>{data.message}</h1>
                <p>Bem-vindo ao IntelliAlloc - Seu sistema de alocação inteligente</p>
              </div>
              <div className="welcome-avatar">
                <div className="avatar-circle">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="stats-grid">
              {getUserStats().map((stat, index) => (
                <div key={index} className="stat-card" style={{ '--card-color': stat.color } as React.CSSProperties}>
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Seção de atalhos */}
            <div className="shortcuts-section">
              <h2>Acesso Rápido</h2>
              <div className="shortcuts-grid">
                {getShortcuts().map((shortcut, index) => (
                  <div 
                    key={index} 
                    className="shortcut-card"
                    onClick={() => navigate(shortcut.path)}
                    style={{ '--shortcut-color': shortcut.color } as React.CSSProperties}
                  >
                    <div className="shortcut-icon">
                      <FontAwesomeIcon icon={shortcut.icon} />
                    </div>
                    <span>{shortcut.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações do usuário */}
            <div className="user-info-section">
              <h2>Informações do Perfil</h2>
              <div className="user-info-grid">
                <CustomCard className="user-info-card" isDarkMode={isDarkMode}>
                  <div className="info-item">
                    <div className="info-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="info-content">
                      <label>Nome de Usuário</label>
                      <span>{currentUsername}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="info-content">
                      <label>E-mail</label>
                      <span>{currentEmail}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">
                      <FontAwesomeIcon icon={faCrown} />
                    </div>
                    <div className="info-content">
                      <label>Cargo</label>
                      <span>{userRole}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="info-content">
                      <label>Conta Criada</label>
                      <span>{formatDate(data.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">
                      <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className="info-content">
                      <label>Último Acesso</label>
                      <span>{formatDate(data.last_access)}</span>
                    </div>
                  </div>
                </CustomCard>
              </div>
            </div>

            {/* Seção de Configurações */}
            <div className="settings-section">
              <h2>Configurações</h2>
              <div className="settings-grid">
                <CustomCard className="settings-card" isDarkMode={isDarkMode}>
                  <div className="settings-header">
                    <FontAwesomeIcon icon={faCog} />
                    <h3>Preferências Visuais</h3>
                  </div>
                  
                  <div className="settings-item">
                    <div className="setting-info">
                      <label>Animação de Fundo</label>
                      <p>Ativa ou desativa a troca automática de cores do fundo da tela</p>
                    </div>
                    <button
                      className={`toggle-button ${isBackgroundAnimationEnabled ? 'enabled' : 'disabled'}`}
                      onClick={toggleBackgroundAnimation}
                    >
                      <FontAwesomeIcon icon={isBackgroundAnimationEnabled ? faToggleOn : faToggleOff} />
                      <span>{isBackgroundAnimationEnabled ? 'Ativada' : 'Desativada'}</span>
                    </button>
                  </div>
                  
                  <div className="settings-item">
                    <div className="setting-info">
                      <label>Modo Escuro</label>
                      <p>Alterna entre o tema claro e escuro da aplicação</p>
                    </div>
                    <button
                      className={`toggle-button ${isDarkMode ? 'enabled' : 'disabled'}`}
                      onClick={toggleTheme}
                    >
                      <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
                      <span>{isDarkMode ? 'Ativado' : 'Desativado'}</span>
                    </button>
                  </div>
                </CustomCard>
              </div>
            </div>
          </div>
        ) : (
          <div className="edit-profile-section">
            <CustomCard className="edit-form-card" isDarkMode={isDarkMode}>
              <div className="edit-header">
                <FontAwesomeIcon icon={faUserCog} />
                <h3>Editar Perfil</h3>
              </div>
              
              <div className="edit-form">
                <div className="input-group">
                  <label>
                    <FontAwesomeIcon icon={faUser} />
                    Nome de Usuário
                  </label>
                  <CustomInput
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="input-neon"
                    isDarkMode={isDarkMode}
                  />
                </div>
                
                <div className="input-group">
                  <label>
                    <FontAwesomeIcon icon={faEnvelope} />
                    E-mail
                  </label>
                  <CustomInput
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input-neon"
                    isDarkMode={isDarkMode}
                  />
                </div>
                
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                
                <div className="edit-form-buttons">
                  <CustomButton
                    onClick={handleUpdateUser}
                    className="save-button"
                    isDarkMode={isDarkMode}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    Salvar
                  </CustomButton>
                  
                  <CustomButton
                    onClick={handleCancelEdit}
                    className="cancel-button"
                    isDarkMode={isDarkMode}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancelar
                  </CustomButton>
                  
                  <CustomButton
                    onClick={handleDeleteUser}
                    className="delete-button"
                    isDarkMode={isDarkMode}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Excluir Conta
                  </CustomButton>
                </div>
              </div>
            </CustomCard>
          </div>
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