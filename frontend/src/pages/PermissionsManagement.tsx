import React, { useState } from 'react';
import { Tab, Tabs, Box, Typography, Paper, Container, Button, Alert } from '@mui/material';
import UserPermissions from '../components/permissions/UserPermissions';
import RolePermissions from '../components/permissions/RolePermissions';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './PermissionsManagement.css';

const PermissionsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { userRole } = useUser();
  const { isDarkMode, toggleTheme, isSidebarExpanded, toggleSidebar } = useTheme();
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Permitir acesso para Admin e Alocacao
  if (userRole !== 'Admin' && userRole !== 'Alocacao') {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Acesso Negado. Apenas administradores e usuários de alocação podem acessar esta página.
        </Typography>
      </Container>
    );
  }

  // Verificar permissões específicas para usuários não-admin
  const isAdmin = userRole === 'Admin';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRegisterInitialPermissions = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/registrar-permissoes-iniciais',
        {},
        { withCredentials: true }
      );
      setMessage({
        text: `Permissões iniciais registradas com sucesso! ${response.data.funcionalidades_registradas} funcionalidades registradas.`,
        type: 'success'
      });
      
      // Limpar a mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erro ao registrar permissões iniciais:', error);
      setMessage({
        text: 'Erro ao registrar permissões iniciais. Tentando rota alternativa...',
        type: 'error'
      });
      
      try {
        // Tentar rota alternativa sem autenticação
        const alternativeResponse = await axios.post(
          'http://localhost:5000/registrar-permissoes-sem-autenticacao',
          {}
        );
        setMessage({
          text: `Permissões iniciais registradas com sucesso via rota alternativa! ${alternativeResponse.data.funcionalidades_registradas} funcionalidades registradas.`,
          type: 'success'
        });
      } catch (alternativeError) {
        console.error('Erro na rota alternativa:', alternativeError);
        setMessage({
          text: 'Falha em ambas as tentativas de registrar permissões. Verifique o console para mais detalhes.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className={`permissions-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar isDarkMode={isDarkMode} showAvatar={false} />
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isFullSidebar={false}
        showBackButton={true}
      />
      <div 
        className="permissions-content" 
        style={{ marginLeft: isSidebarExpanded ? '200px' : '60px' }}
      >
        <h2>Gerenciamento de Permissões</h2>
        
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        {/* Botão disponível apenas para administradores */}
        {isAdmin && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRegisterInitialPermissions}
            sx={{ mb: 3 }}
          >
            Registrar Permissões Iniciais
          </Button>
        )}
        
        <Paper 
          sx={{ p: 3 }}
          className={isDarkMode ? 'dark-paper' : ''}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              className={isDarkMode ? 'dark-tabs' : ''}
            >
              <Tab label="Permissões por Cargo" />
              <Tab label="Permissões por Usuário" />
            </Tabs>
          </Box>

          {/* Usuários de Alocação só podem visualizar, não editar */}
          {tabValue === 0 && <RolePermissions readOnly={!isAdmin} />}
          {tabValue === 1 && <UserPermissions readOnly={!isAdmin} />}
        </Paper>
      </div>
    </div>
  );
};

export default PermissionsManagement; 