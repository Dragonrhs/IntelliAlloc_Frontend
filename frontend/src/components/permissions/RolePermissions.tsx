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
  SelectChangeEvent,
  Stack
} from '@mui/material';
import axios from 'axios';

interface Role {
  id: number;
  nome: string;
  descricao: string;
}

interface Functionality {
  id: number;
  nome: string;
  descricao: string;
  rota: string;
  metodo: string;
  permissao_id?: number;
}

interface RolePermissionsProps {
  readOnly?: boolean;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ readOnly = false }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(parseInt(selectedRole, 10));
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/cargos', {
        withCredentials: true
      });
      setRoles(response.data);
    } catch (err: any) {
      setError('Erro ao carregar cargos');
      console.error('Erro ao carregar cargos:', err);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/cargos/${roleId}/permissoes`, {
        withCredentials: true
      });
      setFunctionalities(response.data);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar permissões do cargo');
      console.error('Erro ao carregar permissões:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const handlePermissionChange = async (functionalityId: number, checked: boolean) => {
    if (!selectedRole) return;

    try {
      if (checked) {
        await axios.post(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes`, {
          funcionalidade_id: functionalityId
        }, {
          withCredentials: true
        });
      } else {
        await axios.delete(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes/${functionalityId}`, {
          withCredentials: true
        });
      }

      // Recarregar permissões
      await loadRolePermissions(parseInt(selectedRole, 10));
      setSuccess('Permissão atualizada com sucesso');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao atualizar permissão');
      console.error('Erro ao atualizar permissão:', err);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedRole) return;

    try {
      const updatedPermissions = functionalities
        .filter(f => f.permissao_id)
        .map(f => f.id);

      await axios.post(`http://localhost:5000/cargos/${parseInt(selectedRole, 10)}/permissoes/batch`, {
        funcionalidades: updatedPermissions
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

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <FormControl fullWidth>
            <InputLabel>Cargo</InputLabel>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              label="Cargo"
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id.toString()}>
                  {role.nome}
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
        ) : selectedRole ? (
          <>
            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Funcionalidades
                </Typography>
                <FormGroup>
                  {functionalities.map((func) => (
                    <FormControlLabel
                      key={func.id}
                      control={
                        <Checkbox
                          checked={!!func.permissao_id}
                          onChange={(e) => handlePermissionChange(func.id, e.target.checked)}
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

export default RolePermissions; 