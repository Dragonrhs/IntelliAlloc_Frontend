import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Adicionado para redirecionamento
import axios from 'axios';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/home', {
          withCredentials: true,
        });
        setData(response.data);
      } catch (error) {
        console.error('Erro ao acessar home:', error);
        navigate('/'); // Redireciona para login se houver erro (ex.: token inválido)
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true, // Envia o cookie para o backend
      });
      alert('Logout realizado com sucesso!');
      navigate('/'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  if (!data) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Home</h2>
      <p>{data.message}</p>
      <p>Email: {data.email}</p>
      <p>Criado em: {data.created_at}</p>
      <p>Último acesso: {data.last_access}</p>
      <button onClick={handleLogout}>Sair</button> {/* Botão de logout */}
    </div>
  );
};

export default Home;