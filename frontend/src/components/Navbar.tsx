import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import Toast from './Toast';
import { useUser } from '../context/UserContext';

interface NavbarProps {
  showAvatar?: boolean; // Prop para controlar se o avatar deve ser exibido
  username?: string; // Username para exibir no avatar e dropdown
  email?: string; // Email para exibir no dropdown
  isDarkMode: boolean; // Prop para modo escuro/claro
  onEditProfile?: () => void; // Função para abrir o formulário de edição de perfil
}

const Navbar: React.FC<NavbarProps> = ({
  showAvatar = false,
  username = '',
  email = '',
  isDarkMode,
  onEditProfile,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();
  const { userRole } = useUser();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setToastMessage('Logout realizado com sucesso!');
      setToastType('success');
      setShowToast(true);
      
      // Aguardar 1 segundo antes de redirecionar para mostrar o toast
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setToastMessage('Erro ao fazer logout');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <>
      <nav className={`navbar ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="navbar-brand">IntelliAlloc</div>
        {showAvatar && username && (
          <div
            className="avatar-container"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar-icon">{username.charAt(0).toUpperCase()}</div>
            {showTooltip && (
              <div className="tooltip">
                <div>{username}</div>
                <div>{email}</div>
                <div>{userRole}</div> {/* Exibe o userRole do contexto no tooltip */}
              </div>
            )}
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="avatar-large">{username.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <div className="username">Olá, {username}!</div>
                    <div className="email">{email}</div>
                    <div className="role">{userRole}</div> {/* Exibe o userRole do contexto no dropdown */}
                  </div>
                </div>
                <div className="dropdown-item" onClick={onEditProfile}>
                  Editar Perfil
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Sair
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default Navbar;