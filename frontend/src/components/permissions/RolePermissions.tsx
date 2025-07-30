import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
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
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../Toast';
import axios from 'axios';
import './PermissionsComponents.css';

interface Role {
  id: number;
  nome: string;
  descricao: string;
}

interface Functionality {
  id: number;
  nome: string;
  descricao: string;
  rota: string;
  metodo: string;
  permissao_id?: number;
}

interface RolePermissionsProps {
  readOnly?: boolean;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ readOnly = false }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(parseInt(selectedRole, 10));
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/cargos', {
        withCredentials: true
      });
      setRoles(response.data);
    } catch (err: any) {
      setToastMessage('Erro ao carregar cargos');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao carregar cargos:', err);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/cargos/${roleId}/permissoes`, {
        withCredentials: true
      });
      setFunctionalities(response.data);
    } catch (err: any) {
      setToastMessage('Erro ao carregar permissões do cargo');
      setToastType('error');
      setShowToast(true);
      console.error('Erro ao carregar permissões:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const handlePermissionChange = async (functionalityId: number, checked: boolean) => {
    if (!selectedRole || readOnly) return;

    try {
      if (checked) {
        await axios.post(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes`, {
          funcionalidade_id: functionalityId
        }, {
          withCredentials: true
        });
      } else {
        await axios.delete(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes/${functionalityId}`, {
          withCredentials: true
        });
      }

      // Recarregar permissões
      await loadRolePermissions(parseInt(selectedRole, 10));
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
    if (!selectedRole || readOnly) return;

    try {
      const updatedPermissions = functionalities
        .filter(f => f.permissao_id)
        .map(f => f.id);

      await axios.post(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes/batch`, {
        funcionalidades: updatedPermissions
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

  const selectedRoleData = roles.find(role => role.id === parseInt(selectedRole, 10));

  return (
    <div className="role-permissions">
      <div className="permissions-section">
        {/* Seleção de Cargo */}
        <div className="role-selector">
          <div className="selector-header">
            <FontAwesomeIcon icon={faUserShield} className="selector-icon" />
            <h3>Selecionar Cargo</h3>
          </div>
          <div className="select-container">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="role-select"
            >
              <option value="">Escolha um cargo...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id.toString()}>
                  {role.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informações do Cargo Selecionado */}
        {selectedRoleData && (
          <div className="role-info">
            <div className="role-info-card">
              <div className="role-info-header">
                <FontAwesomeIcon icon={faShieldAlt} className="role-info-icon" />
                <div className="role-info-content">
                  <h4>{selectedRoleData.nome}</h4>
                  <p>{selectedRoleData.descricao}</p>
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
        ) : selectedRole ? (
          <div className="functionalities-section">
            <div className="functionalities-header">
              <FontAwesomeIcon icon={faKey} className="functionalities-icon" />
              <h3>Funcionalidades e Permissões</h3>
              <p>Marque as funcionalidades que este cargo pode acessar</p>
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
                          checked={!!func.permissao_id}
                          onChange={(e) => handlePermissionChange(func.id, e.target.checked)}
                          disabled={readOnly}
                        />
                        <span className="toggle-slider">
                          <FontAwesomeIcon 
                            icon={func.permissao_id ? faCheck : faTimes} 
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
            <FontAwesomeIcon icon={faUserShield} className="empty-icon" />
            <h3>Selecione um Cargo</h3>
            <p>Escolha um cargo acima para gerenciar suas permissões</p>
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

export default RolePermissions; 