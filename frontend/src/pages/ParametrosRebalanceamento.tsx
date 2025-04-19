import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ParametroModal from '../components/ParametroModal';
import './ParametrosRebalanceamento.css';

interface Parametro {
  id: number;
  nome_parametro: string;
  descricao: string;
  peso_padrao: number;
  ativo: boolean;
}

const ParametrosRebalanceamento: React.FC = () => {
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingParametro, setEditingParametro] = useState<Parametro | null>(null);
  const { isDarkMode, isSidebarExpanded, toggleSidebar, toggleTheme } = useTheme();

  useEffect(() => {
    carregarParametros();
  }, []);

  const carregarParametros = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parametros', {
        withCredentials: true
      });
      setParametros(response.data.parametros);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
      setError('Erro ao carregar parâmetros. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const handleAdicionar = () => {
    setEditingParametro(null);
    setShowModal(true);
  };

  const handleEditar = (parametro: Parametro) => {
    setEditingParametro(parametro);
    setShowModal(true);
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este parâmetro?')) {
      try {
        await axios.delete(`http://localhost:5000/api/parametros/${id}`, {
          withCredentials: true
        });
        carregarParametros();
      } catch (error) {
        console.error('Erro ao excluir parâmetro:', error);
        alert('Erro ao excluir parâmetro. Por favor, tente novamente mais tarde.');
      }
    }
  };

  const handleSalvar = async (parametro: Omit<Parametro, 'id'>) => {
    try {
      if (editingParametro) {
        await axios.put(`http://localhost:5000/api/parametros/${editingParametro.id}`, parametro, {
          withCredentials: true
        });
      } else {
        await axios.post('http://localhost:5000/api/parametros', parametro, {
          withCredentials: true
        });
      }
      setShowModal(false);
      carregarParametros();
    } catch (error) {
      console.error('Erro ao salvar parâmetro:', error);
      alert('Erro ao salvar parâmetro. Por favor, tente novamente mais tarde.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className={`parametros-rebalanceamento-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        isFullSidebar={false}
        toggleTheme={toggleTheme}
      />
      
      <div className="parametros-rebalanceamento-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="header">
          <h1>Parâmetros de Rebalanceamento</h1>
          <button className="add-button" onClick={handleAdicionar}>
            <FontAwesomeIcon icon={faPlus} /> Adicionar Parâmetro
          </button>
        </div>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Peso Padrão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parametros.map((parametro) => (
                <tr key={parametro.id}>
                  <td>{parametro.nome_parametro}</td>
                  <td>{parametro.descricao}</td>
                  <td>{parametro.peso_padrao}</td>
                  <td>
                    <span className={`status ${parametro.ativo ? 'ativo' : 'inativo'}`}>
                      {parametro.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEditar(parametro)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleExcluir(parametro.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <ParametroModal
            parametro={editingParametro}
            onClose={() => setShowModal(false)}
            onSave={handleSalvar}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default ParametrosRebalanceamento; 