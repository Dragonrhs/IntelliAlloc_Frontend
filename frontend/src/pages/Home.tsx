import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [showClients, setShowClients] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true,
        });
        setData(response.data);
      } catch (error) {
        console.error('Erro ao acessar home:', error);
        navigate('/');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true,
      });
      alert('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  const handleAddClient = () => {
    navigate('/suitability');
  };

  const handleViewClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/clients', {
        withCredentials: true,
      });
      setClients(response.data.clients);
      setShowClients(true);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      alert('Erro ao listar clientes');
    }
  };

  const handleEditClient = (clientId: number) => {
    navigate(`/suitability/${clientId}`);
  };

  if (!data) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Home</h2>
      <p>{data.message}</p>
      <p>Email: {data.email}</p>
      <p>Criado em: {data.created_at}</p>
      <p>Último acesso: {data.last_access}</p>
      <button onClick={handleAddClient}>Adicionar Cliente</button>
      <button onClick={handleViewClients}>Visualizar Clientes</button>
      <button onClick={handleLogout}>Sair</button>

      {showClients && (
        <div>
          <h3>Seus Clientes</h3>
          {clients.length === 0 ? (
            <p>Nenhum cliente cadastrado.</p>
          ) : (
            <ul>
              {clients.map((client) => (
                <li key={client.id}>
                  {client.client_name}
                  <button
                    onClick={() => handleEditClient(client.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    ✏️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;