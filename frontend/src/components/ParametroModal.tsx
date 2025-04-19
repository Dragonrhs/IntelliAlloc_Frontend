import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className={`modal ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="modal-header">
          <h2>{parametro ? 'Editar Parâmetro' : 'Adicionar Parâmetro'}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome_parametro">Nome do Parâmetro</label>
            <input
              type="text"
              id="nome_parametro"
              name="nome_parametro"
              value={formData.nome_parametro}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="peso_padrao">Peso Padrão</label>
            <input
              type="number"
              id="peso_padrao"
              name="peso_padrao"
              value={formData.peso_padrao}
              onChange={handleChange}
              step="0.1"
              min="0"
              required
            />
          </div>

          <div className="form-group checkbox">
            <label htmlFor="ativo">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
              />
              Ativo
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-button">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParametroModal; 