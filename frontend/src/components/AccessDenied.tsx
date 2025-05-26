import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './AccessDenied.css';

interface AccessDeniedProps {
  mensagem?: string;
  mostrarBotaoVoltar?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  mensagem = "Você não tem permissão para acessar esta página.",
  mostrarBotaoVoltar = true 
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className={`access-denied-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="access-denied-content">
        <div className="access-denied-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h1>Acesso Negado</h1>
        <p>{mensagem}</p>
        {mostrarBotaoVoltar && (
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default AccessDenied; 