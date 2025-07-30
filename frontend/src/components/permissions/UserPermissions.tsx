import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCog,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faSave,
  faSpinner,
  faShieldAlt,
  faLock,
  faUnlock,
  faCog,
  faDatabase,
  faKey,
  faUserCheck,
  faUserTimes,
  faFilter,
  faSearch,
  faUser,
  faEnvelope,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../Toast';
import axios from 'axios';
import './PermissionsComponents.css';

interface User {
  id: number;
  username: string;
  email: string;
  cargo_id: number;
  cargo_nome: string;
}

interface Functionality {
  id: number;
  nome: string;
  descricao: string;
  rota: string;
  metodo: string;
  permissao_id?: number;
  permitido?: boolean;
}

interface UserPermissionsProps {
  readOnly?: boolean;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ readOnly = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(parseInt(selectedUser, 10));
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users', {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (err: any) {
      setToastMessage('Erro ao carregar usuários');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/usuarios/${userId}/permissoes`, {
        withCredentials: true
      });
      setFunctionalities(response.data);
    } catch (err: any) {
      setToastMessage('Erro ao carregar permissões do usuário');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao carregar permissões do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(event.target.value);
  };

  const handlePermissionChange = async (functionalityId: number, checked: boolean) => {
    if (!selectedUser || readOnly) return;

    try {
      await axios.post(`http://localhost:5000/usuarios/${parseInt(selectedUser, 10)}/permissoes`, {
        funcionalidade_id: functionalityId,
        permitido: checked
      }, {
        withCredentials: true
      });

      // Recarregar permissões
      await loadUserPermissions(parseInt(selectedUser, 10));
      setToastMessage('Permissão atualizada com sucesso');
      setToastType('success');
      setShowToast(true);
    } catch (err: any) {
      setToastMessage('Erro ao atualizar permissão');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao atualizar permissão:', err);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedUser || readOnly) return;

    try {
      const updatedPermissions = functionalities
        .filter(f => f.permissao_id)
        .map(f => ({
          funcionalidade_id: f.id,
          permitido: f.permitido
        }));

      await axios.post(`http://localhost:5000/usuarios/${parseInt(selectedUser, 10)}/permissoes/batch`, {
        permissoes: updatedPermissions
      }, {
        withCredentials: true
      });

      setToastMessage('Todas as permissões foram salvas com sucesso');
      setToastType('success');
      setShowToast(true);
    } catch (err: any) {
      setToastMessage('Erro ao salvar permissões');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao salvar permissões:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cargo_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = users.find(user => user.id === parseInt(selectedUser, 10));

  return (
    <div className="user-permissions">
      <div className="permissions-section">
        {/* Busca de Usuários */}
        <div className="user-search">
          <div className="search-header">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <h3>Buscar Usuário</h3>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Seleção de Usuário */}
        <div className="user-selector">
          <div className="selector-header">
            <FontAwesomeIcon icon={faUserCog} className="selector-icon" />
            <h3>Selecionar Usuário</h3>
          </div>
          <div className="select-container">
            <select
              value={selectedUser}
              onChange={handleUserChange}
              className="user-select"
            >
              <option value="">Escolha um usuário...</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.username} ({user.email}) - {user.cargo_nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informações do Usuário Selecionado */}
        {selectedUserData && (
          <div className="user-info">
            <div className="user-info-card">
              <div className="user-info-header">
                <div className="user-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="user-info-content">
                  <h4>{selectedUserData.username}</h4>
                  <div className="user-details">
                    <div className="user-detail">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{selectedUserData.email}</span>
                    </div>
                    <div className="user-detail">
                      <FontAwesomeIcon icon={faIdCard} />
                      <span>ID: {selectedUserData.id}</span>
                    </div>
                    <div className="user-detail">
                      <FontAwesomeIcon icon={faShieldAlt} />
                      <span>Cargo: {selectedUserData.cargo_nome}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Funcionalidades */}
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
            <p>Carregando permissões...</p>
          </div>
        ) : selectedUser ? (
          <div className="functionalities-section">
            <div className="functionalities-header">
              <FontAwesomeIcon icon={faKey} className="functionalities-icon" />
              <h3>Funcionalidades e Permissões</h3>
              <p>Marque as funcionalidades que este usuário pode acessar</p>
            </div>

            <div className="functionalities-grid">
              {functionalities.map((func) => (
                <div key={func.id} className="functionality-card">
                  <div className="functionality-header">
                    <div className="functionality-info">
                      <h4>{func.nome}</h4>
                      <p className="functionality-description">{func.descricao}</p>
                      <div className="functionality-route">
                        <FontAwesomeIcon icon={faDatabase} />
                        <span>{func.metodo} {func.rota}</span>
                      </div>
                    </div>
                    <div className="permission-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={func.permitido ?? false}
                          onChange={(e) => handlePermissionChange(func.id, e.target.checked)}
                          disabled={readOnly}
                        />
                        <span className="toggle-slider">
                          <FontAwesomeIcon 
                            icon={func.permitido ? faCheck : faTimes} 
                            className="toggle-icon"
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Salvar */}
            {!readOnly && (
              <div className="save-section">
                <button
                  className="save-all-btn"
                  onClick={handleSaveAll}
                >
                  <FontAwesomeIcon icon={faSave} />
                  <span>Salvar Todas as Permissões</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faUserCog} className="empty-icon" />
            <h3>Selecione um Usuário</h3>
            <p>Escolha um usuário acima para gerenciar suas permissões</p>
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

export default UserPermissions; 