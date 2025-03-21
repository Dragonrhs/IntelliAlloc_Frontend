import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/register', { username, email, password });
      alert('Usuário registrado com sucesso!');
      navigate('/'); // Redireciona para a tela de login
    } catch (error) {
      alert('Erro ao registrar usuário');
    }
  };

  const handleBackToLogin = () => {
    navigate('/'); // Redireciona para a tela de login
  };

  return (
    <div>
      <h2>Cadastro</h2>
      <Input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Cadastrar</button>
      <button onClick={handleBackToLogin}>Voltar para Login</button>
    </div>
  );
};

export default Register;
