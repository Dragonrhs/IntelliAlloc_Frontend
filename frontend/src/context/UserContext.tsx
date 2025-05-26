import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  cargo_id: number;
}

interface Permissao {
  rota: string;
  metodo: string;
  permitido: boolean | number;
}

interface UserContextType {
  user: User | null;
  userRole: string | null;
  permissoes: Permissao[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkPermission: (rota: string, metodo: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
      try {
      const response = await axios.get('http://localhost:5000/me', {
          withCredentials: true
        });
      
      if (response.data) {
        setUser(response.data);
        setUserRole(response.data.role);
        await loadPermissoes();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setUserRole(null);
      setPermissoes([]);
      } finally {
        setIsLoading(false);
      }
    };

  const loadPermissoes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/me/permissoes', {
        withCredentials: true
      });
      setPermissoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissoes([]);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Primeiro, fazer login
      await axios.post('http://localhost:5000/login', {
        username,
        password
      }, {
        withCredentials: true
      });

      // Depois, buscar informações do usuário
      await checkAuth();
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setUserRole(null);
      setPermissoes([]);
    }
  };

  const checkPermission = (rota: string, metodo: string): boolean => {
    if (!permissoes.length) {
      console.log('[Permissão] Nenhuma permissão carregada.');
      return false;
    }

    console.log(`[Permissão] Checando permissão para rota: ${rota}, método: ${metodo}`);

    // Função auxiliar para converter o valor permitido em booleano
    const converterPermissao = (valor: boolean | number): boolean => {
      console.log('[Permissão] Valor original do permitido:', valor, 'tipo:', typeof valor);
      if (typeof valor === 'boolean') {
        console.log('[Permissão] Retornando valor booleano:', valor);
        return valor;
      }
      const resultado = valor === 1;
      console.log('[Permissão] Convertendo número para booleano:', valor, '->', resultado);
      return resultado;
    };

    // 1. Tenta match exato
    let permissao = permissoes.find(
      p => p.rota === rota && p.metodo === metodo
    );
    if (permissao) {
      console.log('[Permissão] Match exato encontrado:', permissao);
      console.log('[Permissão] Tipo do permitido:', typeof permissao.permitido);
      const resultado = converterPermissao(permissao.permitido);
      console.log('[Permissão] Resultado final:', resultado);
      return resultado;
    }

    // 2. Tenta match wildcard
    permissao = permissoes.find(
      p => p.rota === rota && p.metodo === '*'
    );
    if (permissao) {
      console.log('[Permissão] Match wildcard encontrado:', permissao);
      console.log('[Permissão] Tipo do permitido:', typeof permissao.permitido);
      const resultado = converterPermissao(permissao.permitido);
      console.log('[Permissão] Resultado final:', resultado);
      return resultado;
    }

    // 3. Tenta match por prefixo (para rotas dinâmicas)
    permissao = permissoes.find(
      p => rota.startsWith(p.rota.replace(/:[^/]+/g, '')) && p.metodo === metodo
    );
    if (permissao) {
      console.log('[Permissão] Match por prefixo encontrado:', permissao);
      console.log('[Permissão] Tipo do permitido:', typeof permissao.permitido);
      const resultado = converterPermissao(permissao.permitido);
      console.log('[Permissão] Resultado final:', resultado);
      return resultado;
    }

    // 4. Tenta match por prefixo + wildcard
    permissao = permissoes.find(
      p => rota.startsWith(p.rota.replace(/:[^/]+/g, '')) && p.metodo === '*'
    );
    if (permissao) {
      console.log('[Permissão] Match por prefixo + wildcard encontrado:', permissao);
      console.log('[Permissão] Tipo do permitido:', typeof permissao.permitido);
      const resultado = converterPermissao(permissao.permitido);
      console.log('[Permissão] Resultado final:', resultado);
      return resultado;
    }

    console.log('[Permissão] Nenhuma permissão encontrada para:', rota, metodo);
    return false;
  };

  return (
    <UserContext.Provider value={{
      user,
      userRole,
      permissoes,
      isLoading,
      login,
      logout,
      checkPermission
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 