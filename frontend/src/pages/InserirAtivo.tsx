import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CustomInput from '../components/CustomInput';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import './InserirAtivo.css';

type ClasseAtivo = 
  | "Renda Fixa"
  | "Fundos"
  | "Prev"
  | "Listados"
  | "Cetipados"
  | "COE"
  | "Fundos Internacionais"
  | "Renda Fixa Internacional";

type CampoAtivo = 
  | "data"
  | "nome"
  | "classe"
  | "canal"
  | "emissor"
  | "risco_credito"
  | "ticker"
  | "isin"
  | "cnpj"
  | "gestora"
  | "prazo_total"
  | "status"
  | "emissor_emissao"
  | "analista_responsavel"
  | "perfil"
  | "master_feeder"
  | "restrito_alocacao";

interface FormData {
  [key: string]: string;
  data: string;
  nome: string;
  classe: string;
  canal: string;
  emissor: string;
  risco_credito: string;
  ticker: string;
  isin: string;
  cnpj: string;
  gestora: string;
  prazo_total: string;
  status: string;
  emissor_emissao: string;
  analista_responsavel: string;
  perfil: string;
  master_feeder: string;
  restrito_alocacao: string;
}

const classesAtivos: ClasseAtivo[] = [
  "Renda Fixa",
  "Fundos",
  "Prev",
  "Listados",
  "Cetipados",
  "COE",
  "Fundos Internacionais",
  "Renda Fixa Internacional"
];

const camposObrigatorios: Record<ClasseAtivo, CampoAtivo[]> = {
  "Renda Fixa": [
    "canal",
    "risco_credito",
    "emissor",
    "ticker",
    "prazo_total",
    "status",
    "data",
    "emissor_emissao",
    "perfil",
    "analista_responsavel"
  ],
  "Fundos": [
    "cnpj",
    "gestora",
    "prazo_total",
    "data",
    "canal",
    "master_feeder",
    "perfil",
    "analista_responsavel",
    "status"
  ],
  "Prev": [
    "cnpj",
    "gestora",
    "prazo_total",
    "data",
    "canal",
    "perfil",
    "analista_responsavel",
    "status"
  ],
  "Listados": [
    "ticker",
    "gestora",
    "prazo_total",
    "data",
    "canal",
    "perfil",
    "status",
    "analista_responsavel"
  ],
  "Cetipados": [
    "ticker",
    "cnpj",
    "gestora",
    "prazo_total",
    "data",
    "canal",
    "perfil",
    "status",
    "analista_responsavel"
  ],
  "COE": [
    "isin",
    "prazo_total",
    "data",
    "canal",
    "perfil",
    "status",
    "analista_responsavel"
  ],
  "Fundos Internacionais": ["isin", "gestora", "prazo_total", "data", "canal", "perfil"],
  "Renda Fixa Internacional": ["isin", "risco_credito", "emissor", "prazo_total", "data", "canal", "emissor_emissao", "perfil"]
};

const camposEmBranco: Record<ClasseAtivo, CampoAtivo[]> = {
  "Renda Fixa": ["isin", "cnpj", "gestora", "master_feeder"],
  "Fundos": ["isin", "emissor", "risco_credito", "ticker", "emissor_emissao"],
  "Prev": ["emissor", "risco_credito", "ticker", "emissor_emissao", "master_feeder"],
  "Listados": ["emissor", "risco_credito", "emissor_emissao", "master_feeder"],
  "Cetipados": ["emissor", "risco_credito", "emissor_emissao", "master_feeder"],
  "COE": ["ticker", "cnpj", "master_feeder"],
  "Fundos Internacionais": ["emissor", "risco_credito", "ticker", "cnpj", "emissor_emissao", "master_feeder"],
  "Renda Fixa Internacional": ["cnpj", "gestora", "master_feeder"]
};

const opcoesPerfil = ['Conservador', 'Moderado', 'Sofisticado', 'Todos'];
const opcoesMasterFeeder = ['', 'Master', 'Feeder'];
const opcoesStatus = ['Em Analise', 'Aprovado', 'Reprovado'];
const opcoesRestritoAlocacao = ['', 'Restrito'];
const opcoesCanal = ['MFO', 'AAI', 'Todos'];
const opcoesEmissorEmissao = ['Emissor', 'Emissao'];
const opcoesAnalistaResponsavel = [
  'Pedro Tintner',
  'Pedro Lessa',
  'Danilo Dominice',
  'Felipe Spolaor',
  'Marcos Macedo',
  'Giuseppe Galante'
];
const opcoesPrazoTotal = ['1', '2', '3', '6', '9', '12', '24'];

const validarISIN = (isin: string) => {
  return /^[A-Z]{2}[A-Z0-9]{10}$/.test(isin);
};

const validarCNPJ = (cnpj: string) => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito1 = 11 - (soma % 11);
  if (digito1 > 9) digito1 = 0;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito2 = 11 - (soma % 11);
  if (digito2 > 9) digito2 = 0;
  
  // Verifica se os dígitos calculados conferem com os informados
  return parseInt(cnpj.charAt(12)) === digito1 && parseInt(cnpj.charAt(13)) === digito2;
};

const formatarCNPJ = (cnpj: string) => {
  // Remove todos os caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  cnpj = cnpj.substring(0, 14);
  
  // Aplica a formatação
  if (cnpj.length <= 2) {
    return cnpj;
  } else if (cnpj.length <= 5) {
    return `${cnpj.substring(0, 2)}.${cnpj.substring(2)}`;
  } else if (cnpj.length <= 8) {
    return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5)}`;
  } else if (cnpj.length <= 12) {
    return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8)}`;
  } else {
    return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12)}`;
  }
};

interface ErroImportacao {
  linha: number;
  erro: string;
}

const InserirAtivo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const { userRole } = useUser();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [camposVisiveis, setCamposVisiveis] = useState<CampoAtivo[]>([]);

  const [formData, setFormData] = useState<FormData>({
    data: '',
    nome: '',
    classe: '',
    canal: '',
    emissor: '',
    risco_credito: '',
    ticker: '',
    isin: '',
    cnpj: '',
    gestora: '',
    prazo_total: '',
    status: '',
    emissor_emissao: '',
    analista_responsavel: '',
    perfil: '',
    master_feeder: '',
    restrito_alocacao: ''
  });

  useEffect(() => {
    if (formData.classe && formData.classe !== '') {
      const classe = formData.classe as ClasseAtivo;
      const camposObrigatoriosClasse = camposObrigatorios[classe] || [];
      const camposEmBrancoClasse = camposEmBranco[classe] || [];
      
      // Limpar campos que devem estar em branco
      const novoFormData = { ...formData };
      camposEmBrancoClasse.forEach((campo: CampoAtivo) => {
        novoFormData[campo] = '';
      });
      setFormData(novoFormData);

      // Atualizar campos visíveis
      setCamposVisiveis(camposObrigatoriosClasse);
    } else {
      // Se a classe estiver vazia, ocultar todos os campos
      setCamposVisiveis([]);
    }
  }, [formData.classe]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrorMessage('');
    
    // Formata o CNPJ enquanto digita
    if (name === 'cnpj') {
      const cnpjFormatado = formatarCNPJ(value);
      setFormData(prev => ({
        ...prev,
        [name]: cnpjFormatado
      }));
    } else {
      handleChange(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/ativos', formData, {
        withCredentials: true
      });

      if (response.status === 201) {
        setSuccessMessage('Ativo inserido com sucesso!');
        setTimeout(() => {
          navigate('/ativos');
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Erro ao inserir ativo');
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

  const renderCampo = (nome: CampoAtivo, label: string, tipo: string = 'text') => {
    // Se a classe estiver vazia, não renderizar nenhum campo exceto o select de classe
    if (formData.classe === '' && nome !== 'classe') return null;

    const isObrigatorio = camposVisiveis.includes(nome);
    const isVisivel = isObrigatorio || !camposEmBranco[formData.classe as ClasseAtivo]?.includes(nome);

    if (!isVisivel) return null;

    const handleCampoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setErrorMessage('');
      
      // Formata o CNPJ enquanto digita
      if (name === 'cnpj') {
        const cnpjFormatado = formatarCNPJ(value);
        setFormData(prev => ({
          ...prev,
          [name]: cnpjFormatado
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      if (name === 'isin' && value) {
        if (!validarISIN(value)) {
          setErrorMessage('ISIN inválido. Deve conter 12 caracteres e começar com 2 letras.');
        }
      }
      
      if (name === 'cnpj' && value) {
        if (!validarCNPJ(value)) {
          setErrorMessage('CNPJ inválido. Verifique o número e os dígitos verificadores.');
        }
      }
    };

    return (
      <div className="form-group">
        <label htmlFor={nome}>
          {label} {isObrigatorio && <span className="required">*</span>}
        </label>
        {tipo === 'select' ? (
          <select
            id={nome}
            name={nome}
            value={formData[nome]}
            onChange={handleCampoChange}
            required={isObrigatorio}
            className={`custom-select ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
          >
            <option value="">Selecione...</option>
            {nome === 'classe' && classesAtivos.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'perfil' && opcoesPerfil.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'master_feeder' && opcoesMasterFeeder.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'status' && opcoesStatus.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'restrito_alocacao' && opcoesRestritoAlocacao.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'canal' && opcoesCanal.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'emissor_emissao' && opcoesEmissorEmissao.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'analista_responsavel' && opcoesAnalistaResponsavel.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            {nome === 'prazo_total' && opcoesPrazoTotal.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <CustomInput
            type={tipo}
            id={nome}
            name={nome}
            value={formData[nome]}
            onChange={handleCampoChange}
            onBlur={handleBlur}
            required={isObrigatorio}
            isDarkMode={isDarkMode}
            pattern={nome === 'isin' ? '[A-Z]{2}[A-Z0-9]{10}' : undefined}
            maxLength={nome === 'cnpj' ? 14 : undefined}
          />
        )}
      </div>
    );
  };

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
        <div className="form-container">
          <h2>Inserir Novo Ativo</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit}>
            {renderCampo('data', 'Data', 'date')}
            {renderCampo('nome', 'Nome')}
            {renderCampo('classe', 'Classe', 'select')}
            {renderCampo('canal', 'Canal', 'select')}
            {renderCampo('emissor', 'Emissor')}
            {renderCampo('risco_credito', 'Risco de Crédito')}
            {renderCampo('ticker', 'Ticker')}
            {renderCampo('isin', 'ISIN')}
            {renderCampo('cnpj', 'CNPJ')}
            {renderCampo('gestora', 'Gestora')}
            {renderCampo('prazo_total', 'Prazo Total (meses)', 'select')}
            {renderCampo('status', 'Status', 'select')}
            {renderCampo('emissor_emissao', 'Emissor ou Emissão', 'select')}
            {renderCampo('analista_responsavel', 'Analista Responsável', 'select')}
            {renderCampo('perfil', 'Perfil', 'select')}
            {renderCampo('master_feeder', 'Master ou Feeder', 'select')}
            {renderCampo('restrito_alocacao', 'Restrito para Alocação', 'select')}

            <div className="form-actions">
              <button type="submit" className="submit-button">Inserir Ativo</button>
              <button type="button" className="cancel-button" onClick={() => navigate('/consultar-ativos')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InserirAtivo; 