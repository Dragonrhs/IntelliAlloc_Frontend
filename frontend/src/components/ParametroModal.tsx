import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave, 
  faSpinner, 
  faCog, 
  faCheckCircle, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import CustomButton from './CustomButton';
import Toast from './Toast';
import './ParametroModal.css';

interface Parametro {
  id?: number;
  nome_parametro: string;
  descricao: string;
  peso_padrao: number;
  ativo: boolean;
}

interface ParametroModalProps {
  parametro: Parametro | null;
  onClose: () => void;
  onSave: (parametro: Omit<Parametro, 'id'>) => void;
  isDarkMode: boolean;
}

const ParametroModal: React.FC<ParametroModalProps> = ({
  parametro,
  onClose,
  onSave,
  isDarkMode
}) => {
  const [formData, setFormData] = useState<Omit<Parametro, 'id'>>({
    nome_parametro: '',
    descricao: '',
    peso_padrao: 1.0,
    ativo: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (parametro) {
      setFormData({
        nome_parametro: parametro.nome_parametro,
        descricao: parametro.descricao,
        peso_padrao: parametro.peso_padrao,
        ativo: parametro.ativo
      });
    } else {
      setFormData({
        nome_parametro: '',
        descricao: '',
        peso_padrao: 1.0,
        ativo: true
      });
    }
  }, [parametro]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_parametro.trim() || !formData.descricao.trim()) {
      setToastMessage('Por favor, preencha todos os campos obrigatórios');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setIsLoading(true);
      await onSave(formData);
      setToastMessage(parametro ? 'Parâmetro atualizado com sucesso!' : 'Parâmetro adicionado com sucesso!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setToastMessage('Erro ao salvar parâmetro');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = () => {
    if (!formData.nome_parametro.trim() || !formData.descricao.trim()) {
      setToastMessage('Por favor, preencha todos os campos obrigatórios');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const saveData = async () => {
      try {
        setIsLoading(true);
        await onSave(formData);
        setToastMessage(parametro ? 'Parâmetro atualizado com sucesso!' : 'Parâmetro adicionado com sucesso!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        setToastMessage('Erro ao salvar parâmetro');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };

    saveData();
  };

  return (
    <>
      <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className={`modal ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="modal-header">
            <div className="header-content">
              <FontAwesomeIcon icon={faCog} className="header-icon" />
              <div className="header-text">
                <h2>{parametro ? 'Editar Parâmetro' : 'Adicionar Parâmetro'}</h2>
                <p>{parametro ? 'Modifique as informações do parâmetro' : 'Configure um novo parâmetro de rebalanceamento'}</p>
              </div>
            </div>
            <button className="close-button" onClick={onClose} disabled={isLoading}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content">
              <div className="form-group">
                <label htmlFor="nome_parametro">
                  <FontAwesomeIcon icon={faCog} />
                  Nome do Parâmetro
                </label>
                <input
                  type="text"
                  id="nome_parametro"
                  name="nome_parametro"
                  value={formData.nome_parametro}
                  onChange={handleChange}
                  placeholder="Digite o nome do parâmetro"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">
                  <FontAwesomeIcon icon={faCog} />
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva o propósito deste parâmetro"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="peso_padrao">
                  <FontAwesomeIcon icon={faCog} />
                  Peso Padrão
                </label>
                <input
                  type="number"
                  id="peso_padrao"
                  name="peso_padrao"
                  value={formData.peso_padrao}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="1.0"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group checkbox">
                <label htmlFor="ativo" className="checkbox-label">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="ativo"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                  </div>
                  <div className="checkbox-text">
                    <span className="checkbox-title">Ativo</span>
                    <span className="checkbox-description">Parâmetro disponível para uso</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <CustomButton 
                onClick={onClose} 
                isDarkMode={isDarkMode}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancelar
              </CustomButton>
              <CustomButton 
                onClick={handleSaveClick}
                isDarkMode={isDarkMode}
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    {parametro ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>

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

export default ParametroModal; 