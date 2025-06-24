import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useUser } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { 
  faHome, 
  faUsers, 
  faUserPlus, 
  faHistory, 
  faCog, 
  faScroll, 
  faChartBar, 
  faBriefcase, 
  faPlus, 
  faEdit, 
  faSync, 
  faSearch,
  faSun,
  faMoon,
  faChevronLeft,
  faChevronRight,
  faClockRotateLeft,
  faBalanceScale,
  faChartLine,
  faSliders,
  faCalendarCheck,
  faLock,
  faTags
} from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onAddClient?: () => void;
  isFullSidebar: boolean;
  showBackButton?: boolean;
}

interface Permission {
  rota: string;
  metodo: string;
  permitido?: boolean;
}

// Mapeamento de rotas para ícones e rótulos
const routeIcons: Record<string, { label: string; icon: any }> = {
  '/home': { label: 'Home', icon: faHome },
  '/clients': { label: 'Clientes', icon: faUsers },
  '/suitability': { label: 'Novo Cliente', icon: faUserPlus },
  '/history': { label: 'Histórico', icon: faHistory },
  '/management': { label: 'Gerenciamento', icon: faCog },
  '/permissions': { label: 'Permissões', icon: faLock },
  '/system-history': { label: 'Histórico do Sistema', icon: faScroll },
  '/estatisticas': { label: 'Estatísticas', icon: faChartBar },
  '/view-recommended-portfolio': { label: 'Carteiras Recomendadas', icon: faBriefcase },
  '/recommended-portfolio': { label: 'Adicionar Carteira', icon: faPlus },
  '/asset-class-evaluation': { label: 'Avaliação de Classes', icon: faBalanceScale },
  '/view-asset-class': { label: 'Visualizar Avaliações', icon: faChartLine },
  '/avaliacao-mensal-classes': { label: 'Avaliação Mensal de Classes', icon: faCalendarCheck },
  '/parametros-rebalanceamento': { label: 'Parâmetros de Rebalanceamento', icon: faSliders },
  '/escolha-inserir-ativo': { label: 'Inserir Ativo', icon: faEdit },
  '/atualizar-ativo': { label: 'Atualizar Ativo', icon: faSync },
  '/consultar-ativos': { label: 'Consultar Ativos', icon: faSearch },
  '/historico-ativo': { label: 'Histórico de Ativos', icon: faClockRotateLeft },
  '/classificar-ativos': { label: 'Classificar Ativos', icon: faTags },
  '/historico-classificacao': { label: 'Histórico de Classificações', icon: faClockRotateLeft }
};

// Agrupamentos de menu para melhor organização
const menuGroups = [
  {
    id: 'home',
    title: 'Principal',
    routes: ['/home']
  },
  {
    id: 'clients',
    title: 'Clientes',
    routes: ['/clients', '/suitability', '/history']
  },
  {
    id: 'admin',
    title: 'Administração',
    routes: ['/management', '/permissions', '/system-history']
  },
  {
    id: 'portfolio',
    title: 'Carteiras',
    routes: ['/estatisticas', '/view-recommended-portfolio', '/recommended-portfolio']
  },
  {
    id: 'assetClass',
    title: 'Classes de Ativos',
    routes: ['/asset-class-evaluation', '/view-asset-class', '/avaliacao-mensal-classes', '/parametros-rebalanceamento']
  },
  {
    id: 'assets',
    title: 'Ativos',
    routes: ['/escolha-inserir-ativo', '/atualizar-ativo', '/consultar-ativos', '/classificar-ativos', '/historico-ativo', '/historico-classificacao']
  }
];

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  toggleSidebar,
  isDarkMode,
  toggleTheme,
  onAddClient,
  isFullSidebar,
  showBackButton = false
}) => {
  const navigate = useNavigate();
  const { userRole, user } = useUser();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuItems, setMenuItems] = useState<{path: string, label: string, icon: any}[]>([]);
  
  // Obter userId do localStorage se não estiver disponível no contexto
  const [localUserId, setLocalUserId] = useState<number | null>(() => {
    const savedUserId = localStorage.getItem('userId');
    return savedUserId ? parseInt(savedUserId, 10) : null;
  });

  useEffect(() => {
    // Usar userId do contexto ou do localStorage
    const effectiveUserId = user?.id || localUserId;
    
    console.log("Sidebar carregando com:", { userRole, user, localUserId, effectiveUserId });
    
    if (effectiveUserId) {
      fetchUserPermissions(effectiveUserId);
    } else {
      setLoading(false);
      console.log("Sem userId para buscar permissões", { userRole });
    }
  }, [user?.id, userRole, localUserId]);

  useEffect(() => {
    // Construir menu baseado nas permissões ou cargo
    buildMenuFromPermissions();
  }, [permissions, userRole]);

  const fetchUserPermissions = async (effectiveUserId: number) => {
    try {
      console.log("Buscando permissões para o usuário", { effectiveUserId, userRole });
      
      // Primeiro, tentar obter permissões de usuário específicas
      const response = await axios.get(`http://localhost:5000/usuarios/${effectiveUserId}/permissoes`, {
        withCredentials: true
      });
      
      // Processar e armazenar permissões
      const userPermissions = response.data.map((p: any) => ({
        rota: p.rota,
        metodo: p.metodo,
        permitido: p.permitido
      }));
      
      console.log("Permissões obtidas:", userPermissions.length);
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      
      // Como fallback, tentar obter permissões de cargo se o userRole estiver disponível
      if (userRole && userRole !== 'Membro') {
        try {
          // Encontrar o ID do cargo pelo nome
          const cargosResponse = await axios.get('http://localhost:5000/cargos', {
            withCredentials: true
          });
          
          const cargo = cargosResponse.data.find((c: any) => c.nome === userRole);
          
          if (cargo) {
            const cargoPermissionsResponse = await axios.get(`http://localhost:5000/cargos/${cargo.id}/permissoes`, {
              withCredentials: true
            });
            
            const cargoPermissions = cargoPermissionsResponse.data
              .filter((p: any) => p.permissao_id) // Apenas permissões ativas
              .map((p: any) => ({
                rota: p.rota,
                metodo: p.metodo,
                permitido: true
              }));
            
            console.log("Permissões de cargo obtidas:", cargoPermissions.length);
            setPermissions(cargoPermissions);
          }
        } catch (cargoError) {
          console.error('Erro ao buscar permissões de cargo:', cargoError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const buildMenuFromPermissions = () => {
    const items: {path: string, label: string, icon: any}[] = [];
    
    // Home sempre é adicionado
    items.push({
      path: '/home',
      label: 'Home',
      icon: faHome
    });
    
    if (userRole === 'Admin') {
      // Admin tem acesso a tudo
      Object.keys(routeIcons).forEach(route => {
        if (route !== '/home') { // Home já foi adicionado
          items.push({
            path: route,
            label: routeIcons[route].label,
            icon: routeIcons[route].icon
          });
        }
      });
    } else {
      // Para outros usuários, verificar permissões
      console.log(`Construindo menu para ${userRole} com ${permissions.length} permissões`);
      
      // Lista de rotas permitidas
      const allowedRoutes = new Set<string>();
      
      // Adicionar rotas com base nas permissões
      permissions.forEach(permission => {
        if (permission.permitido) {
          // Converter rotas com parâmetros (ex: '/usuarios/<int:user_id>/permissoes') para rotas base
          let baseRoute = permission.rota;
          if (baseRoute.includes('<')) {
            baseRoute = baseRoute.split('<')[0].replace(/\/$/, '');
          }
          
          // Mapear rotas específicas da API para rotas do frontend
          const frontendRoute = mapApiRouteToFrontend(baseRoute);
          if (frontendRoute) {
            allowedRoutes.add(frontendRoute);
            console.log(`Permissão encontrada: ${permission.rota} -> ${frontendRoute}`);
          }
        }
      });
      
      // Adicionar itens de menu para rotas permitidas
      allowedRoutes.forEach(route => {
        if (route !== '/home' && routeIcons[route]) { // Home já foi adicionado e rota deve ter ícone definido
          items.push({
            path: route,
            label: routeIcons[route].label,
            icon: routeIcons[route].icon
          });
        }
      });
    }
    
    console.log(`Menu construído com ${items.length} itens`);
    setMenuItems(items);
  };
  
  // Função para mapear rotas da API para rotas do frontend
  const mapApiRouteToFrontend = (apiRoute: string): string | null => {
    // Mapeamento direto de algumas rotas
    const apiToFrontendMap: Record<string, string> = {
      '/usuarios': '/management',
      '/cargos': '/permissions',
      '/funcionalidades': '/permissions',
      '/permissions': '/permissions',
      '/client': '/clients',
      '/estatisticas': '/estatisticas',
      '/recomendacoes': '/view-recommended-portfolio',
      '/classes': '/view-asset-class',
      '/ativos': '/consultar-ativos',
      '/historico': '/history',
      '/api/history/classificacao': '/historico-classificacao'
    };
    
    // Verificar mapeamento direto
    for (const [api, frontend] of Object.entries(apiToFrontendMap)) {
      if (apiRoute.startsWith(api)) {
        return frontend;
      }
    }
    
    // Rotas que não precisam de mapeamento
    if (Object.keys(routeIcons).includes(apiRoute)) {
      return apiRoute;
    }
    
    return null;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const hasPermission = (route: string, method: string = 'GET') => {
    // Se ainda está carregando ou é admin, libera tudo
    if (loading || userRole === 'Admin') return true;
    
    // Imprimir log detalhado para depuração
    console.log(`Verificando permissão para ${route} (${method}) - ${permissions.length} permissões disponíveis`);
    
    // Verificar permissões específicas do usuário vindas da API
    if (permissions.length > 0) {
      // Primeiro, procurar permissão específica para essa rota e método
      const exactPermission = permissions.find(p => 
        p.rota === route && (p.metodo === method || p.metodo === '*')
      );
      
      if (exactPermission) {
        console.log(`Permissão encontrada para ${route} (${method}):`, exactPermission.permitido);
        return exactPermission.permitido;
      }
      
      // Segundo, procurar permissão coringa para a rota
      const routeWildcardPermission = permissions.find(p => 
        p.rota === route && p.metodo === '*'
      );
      
      if (routeWildcardPermission) {
        console.log(`Permissão wildcard encontrada para ${route}:`, routeWildcardPermission.permitido);
        return routeWildcardPermission.permitido;
      }
      
      // Terceiro, procurar permissão global
      const globalPermission = permissions.find(p => p.rota === '*');
      if (globalPermission) {
        console.log(`Permissão global encontrada:`, globalPermission.permitido);
        return globalPermission.permitido;
      }
      
      // Verificar se existe uma permissão com nome semelhante (para depuração)
      const similarPermissions = permissions
        .filter(p => p.rota && p.rota.includes(route.split('/')[1]))
        .map(p => ({ rota: p.rota, metodo: p.metodo, permitido: p.permitido }));
      
      if (similarPermissions.length > 0) {
        console.log(`Permissões similares encontradas para ${route}:`, similarPermissions);
      }
    }
    
    console.log(`Sem permissão para ${route} (${method})`);
    return false;
  };

  // Função para renderizar um item de menu
  const renderMenuItem = (item: {path: string, label: string, icon: any}) => {
    return (
      <li key={item.path}>
        <button onClick={() => handleNavigation(item.path)} title={!isExpanded ? item.label : ''}>
          {isExpanded ? item.label : <FontAwesomeIcon icon={item.icon} />}
              </button>
            </li>
    );
  };

  // Se estiver carregando, mostra apenas o botão de home
  if (loading) {
    return (
      <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="sidebar-header">
          <button className="toggle-button" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => handleNavigation('/home')} title={!isExpanded ? 'Home' : ''}>
                {isExpanded ? 'Home' : <FontAwesomeIcon icon={faHome} />}
              </button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
            {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
          </button>
        </div>
      </div>
    );
  }

  // Organizar itens por grupos para melhor visualização
  const organizeMenuItemsByGroups = () => {
    const organizedItems: {[key: string]: {path: string, label: string, icon: any}[]} = {};
    
    // Inicializar grupos vazios
    menuGroups.forEach(group => {
      organizedItems[group.id] = [];
    });
    
    // Distribuir itens nos grupos
    menuItems.forEach(item => {
      for (const group of menuGroups) {
        if (group.routes.includes(item.path)) {
          organizedItems[group.id].push(item);
          break;
        }
      }
    });
    
    return organizedItems;
  };

  const organizedMenuItems = organizeMenuItemsByGroups();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} title={!isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : ''}>
          {isExpanded ? (isDarkMode ? 'Modo Claro' : 'Modo Escuro') : <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;