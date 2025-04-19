import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './ImportarAtivosLote.css';

interface ErroImportacao {
  linha: number;
  erro: string;
}

const ImportarAtivosLote: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { userRole } = useUser();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [errosImportacao, setErrosImportacao] = useState<ErroImportacao[]>([]);
  const [mensagemImportacao, setMensagemImportacao] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
      setErrosImportacao([]);
      setMensagemImportacao('');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) {
      setMensagemImportacao('Por favor, selecione um arquivo para importar');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', arquivo);

    try {
      const response = await axios.post('http://localhost:5000/api/ativos/importar-lote', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (response.data.erros && response.data.erros.length > 0) {
        setErrosImportacao(response.data.erros);
        setMensagemImportacao(response.data.message);
      } else {
        setMensagemImportacao(response.data.message);
        setTimeout(() => {
          navigate('/consultar-ativos');
        }, 3000);
      }
    } catch (error: any) {
      setMensagemImportacao(error.response?.data?.error || 'Erro ao importar ativos');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se o usuário tem permissão
  if (userRole !== 'Admin' && userRole !== 'Research') {
    return (
      <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Navbar isDarkMode={isDarkMode} showAvatar={false} />
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isFullSidebar={false}
        />
        <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
      />
      <div className="main-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        <div className="importar-container">
          <h2>Importar Ativos em Lote</h2>
          
          {mensagemImportacao && (
            <div className={`mensagem-importacao ${errosImportacao.length > 0 ? 'erro' : 'sucesso'}`}>
              {mensagemImportacao}
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="importar-form">
            <div className="form-group">
              <label htmlFor="arquivo">Selecione o arquivo Excel (.xlsx ou .xls)</label>
              <input
                type="file"
                id="arquivo"
                accept=".xlsx,.xls"
                onChange={handleArquivoChange}
                className="file-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Importando...' : 'Importar'}
              </button>
              <button type="button" className="cancel-button" onClick={() => navigate('/consultar-ativos')}>
                Cancelar
              </button>
            </div>
          </form>

          {errosImportacao.length > 0 && (
            <div className="erros-container">
              <h3>Erros encontrados:</h3>
              <table className="erros-table">
                <thead>
                  <tr>
                    <th>Linha</th>
                    <th>Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {errosImportacao.map((erro, index) => (
                    <tr key={index}>
                      <td>{erro.linha}</td>
                      <td>{erro.erro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportarAtivosLote; 