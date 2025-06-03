import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  cargo_id: number;
  cargo_nome: string;
}

interface Functionality {
  id: number;
  nome: string;
  descricao: string;
  rota: string;
  metodo: string;
  permissao_id?: number;
  permitido?: boolean;
}

interface UserPermissionsProps {
  readOnly?: boolean;
}

const UserPermissions: React.FC<UserPermissionsProps> = ({ readOnly = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(parseInt(selectedUser, 10));
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users', {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (err: any) {
      setError('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/usuarios/${userId}/permissoes`, {
        withCredentials: true
      });
      setFunctionalities(response.data);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar permissões do usuário');
      console.error('Erro ao carregar permissões do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event: SelectChangeEvent) => {
    setSelectedUser(event.target.value);
  };

  const handlePermissionChange = async (functionalityId: number, checked: boolean) => {
    if (!selectedUser) return;

    try {
      await axios.post(`http://localhost:5000/usuarios/${parseInt(selectedUser, 10)}/permissoes`, {
        funcionalidade_id: functionalityId,
        permitido: checked
      }, {
        withCredentials: true
      });

      // Recarregar permissões
      await loadUserPermissions(parseInt(selectedUser, 10));
      setSuccess('Permissão atualizada com sucesso');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao atualizar permissão');
      console.error('Erro ao atualizar permissão:', err);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedUser) return;

    try {
      const updatedPermissions = functionalities
        .filter(f => f.permissao_id)
        .map(f => ({
          funcionalidade_id: f.id,
          permitido: f.permitido
        }));

      await axios.post(`http://localhost:5000/usuarios/${parseInt(selectedUser, 10)}/permissoes/batch`, {
        permissoes: updatedPermissions
      }, {
        withCredentials: true
      });

      setSuccess('Todas as permissões foram salvas com sucesso');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao salvar permissões');
      console.error('Erro ao salvar permissões:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = users.find(user => user.id === parseInt(selectedUser, 10));

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <TextField
            fullWidth
            label="Buscar usuário"
            variant="outlined"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Usuário</InputLabel>
            <Select
              value={selectedUser}
              onChange={handleUserChange}
              label="Usuário"
            >
              {filteredUsers.map((user) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.username} ({user.email}) - {user.cargo_nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Box>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {success && (
          <Box>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : selectedUser ? (
          <>
            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Funcionalidades
                </Typography>
                {selectedUserData && (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cargo atual: {selectedUserData.cargo_nome}
                  </Typography>
                )}
                <FormGroup>
                  {functionalities.map((func) => (
                    <FormControlLabel
                      key={func.id}
                      control={
                        <Checkbox
                          checked={func.permitido ?? false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePermissionChange(func.id, e.target.checked)}
                          disabled={readOnly}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1">{func.nome}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {func.descricao}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {func.metodo} {func.rota}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Paper>
            </Box>

            {!readOnly && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveAll}
                  fullWidth
                >
                  Salvar Todas as Permissões
                </Button>
              </Box>
            )}
          </>
        ) : null}
      </Stack>
    </Box>
  );
};

export default UserPermissions; 