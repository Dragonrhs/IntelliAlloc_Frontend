import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCog,
  faUserEdit,
  faUserShield,
  faUserTie,
  faUserGraduate,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faCrown,
  faUser,
  faEnvelope,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import './Management.css';

interface User {
  id: number;
  username: string;
  email: string;
  cargo_id: number;
  cargo_nome: string;
}

interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar, isBackgroundAnimationEnabled, selectedBackgroundColor } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Buscar usuários
        const usersResponse = await axios.get('http://localhost:5000/users', {
          withCredentials: true,
        });
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        
        // Buscar cargos
        const cargosResponse = await axios.get('http://localhost:5000/cargos', {
          withCredentials: true,
        });
        setCargos(cargosResponse.data);
        
        setToastMessage('Dados carregados com sucesso!');
        setToastType('success');
        setShowToast(true);
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        setToastMessage(error.response?.data?.error || 'Erro ao buscar dados');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cargo_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por cargo
    if (filterBy !== 'all') {
      filtered = filtered.filter(user => user.cargo_nome === filterBy);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterBy]);

  const handleCargoChange = async (userId: number, newCargoId: number) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/users/${userId}/role`,
        { cargo_id: newCargoId },
        { withCredentials: true }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { 
          ...user, 
          cargo_id: newCargoId,
          cargo_nome: cargos.find(c => c.id === newCargoId)?.nome || user.cargo_nome
        } : user
      ));
      
      setToastMessage('Cargo atualizado com sucesso!');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      setToastMessage(error.response?.data?.error || 'Erro ao atualizar cargo');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getCargoIcon = (cargoNome: string) => {
    const cargoLower = cargoNome.toLowerCase();
    
    switch (cargoLower) {
      case 'admin':
      case 'administrador':
        return faCrown;
      case 'gerente':
      case 'manager':
        return faUserShield;
      case 'analista':
      case 'analyst':
        return faUserTie;
      case 'membro':
      case 'member':
        return faUser;
      case 'alocacao':
      case 'allocation':
        return faUserGraduate;
      case 'ps':
      case 'portfolio':
        return faUserCog;
      default:
        // Para cargos não mapeados, usar ícone baseado no primeiro caractere
        if (cargoLower.includes('admin') || cargoLower.includes('adm')) {
          return faCrown;
        } else if (cargoLower.includes('ger') || cargoLower.includes('man')) {
          return faUserShield;
        } else if (cargoLower.includes('anal') || cargoLower.includes('an')) {
          return faUserTie;
        } else if (cargoLower.includes('mem') || cargoLower.includes('user')) {
          return faUser;
        } else {
          return faUserGraduate;
        }
    }
  };

  const getCargoColor = (cargoNome: string) => {
    const cargoLower = cargoNome.toLowerCase();
    
    switch (cargoLower) {
      case 'admin':
      case 'administrador':
        return '#ff6b6b';
      case 'gerente':
      case 'manager':
        return '#4ecdc4';
      case 'analista':
      case 'analyst':
        return '#45b7d1';
      case 'membro':
      case 'member':
        return '#96ceb4';
      case 'alocacao':
      case 'allocation':
        return '#feca57';
      case 'ps':
      case 'portfolio':
        return '#a55eea';
      default:
        // Para cargos não mapeados, gerar cor baseada no nome
        if (cargoLower.includes('admin') || cargoLower.includes('adm')) {
          return '#ff6b6b';
        } else if (cargoLower.includes('ger') || cargoLower.includes('man')) {
          return '#4ecdc4';
        } else if (cargoLower.includes('anal') || cargoLower.includes('an')) {
          return '#45b7d1';
        } else if (cargoLower.includes('mem') || cargoLower.includes('user')) {
          return '#96ceb4';
        } else {
          // Gerar cor baseada no hash do nome do cargo
          const hash = cargoLower.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          const hue = Math.abs(hash) % 360;
          return `hsl(${hue}, 70%, 60%)`;
        }
    }
  };

  const getStats = () => {
    const total = users.length;
    
    // Obter cargos únicos dos usuários
    const cargosUnicos = Array.from(new Set(users.map(user => user.cargo_nome)));
    
    // Criar estatísticas dinâmicas baseadas nos cargos existentes
    const stats = [
      { label: 'Total de Usuários', value: total, icon: faUsers, color: '#667eea' }
    ];
    
    // Adicionar estatísticas para cada cargo existente
    cargosUnicos.forEach(cargo => {
      const count = users.filter(user => user.cargo_nome === cargo).length;
      const icon = getCargoIcon(cargo);
      const color = getCargoColor(cargo);
      
      stats.push({
        label: cargo,
        value: count,
        icon: icon,
        color: color
      });
    });
    
    return stats;
  };

  if (isLoading) {
    return (
      <div 
        className={`management-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
        style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`management-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isBackgroundAnimationEnabled ? 'animated' : 'no-animation'}`}
      style={!isBackgroundAnimationEnabled ? { '--selected-background-color': selectedBackgroundColor } as React.CSSProperties : {}}
    >
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      
      <div className="management-content" style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}>
        {/* Header */}
        <div className="management-header">
          <div className="header-content">
            <div className="header-title">
              <FontAwesomeIcon icon={faUserCog} className="header-icon" />
              <h1>Gerenciamento de Usuários</h1>
            </div>
            <p>Gerencie permissões e cargos dos usuários do sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-section">
          <div className="stats-grid">
            {getStats().map((stat, index) => (
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
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos os Cargos</option>
              {Array.from(new Set(users.map(user => user.cargo_nome))).map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="users-section">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faUsers} className="empty-icon" />
              <h3>Nenhum usuário encontrado</h3>
              <p>Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      <FontAwesomeIcon icon={getCargoIcon(user.cargo_nome)} />
                    </div>
                    <div className="user-info">
                      <h4>{user.username}</h4>
                      <p className="user-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {user.email}
                      </p>
                      <p className="user-id">
                        <FontAwesomeIcon icon={faIdCard} />
                        ID: {user.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="user-cargo">
                    <div className="cargo-badge" style={{ backgroundColor: getCargoColor(user.cargo_nome) }}>
                      <FontAwesomeIcon icon={getCargoIcon(user.cargo_nome)} />
                      <span>{user.cargo_nome}</span>
                    </div>
                    
                    <select
                      className="cargo-select"
                      value={user.cargo_id}
                      onChange={(e) => handleCargoChange(user.id, parseInt(e.target.value, 10))}
                    >
                      {cargos.map(cargo => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default Management;