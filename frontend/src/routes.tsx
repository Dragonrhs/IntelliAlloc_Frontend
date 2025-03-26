import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ClientsList from './pages/ClientsList';
import History from './pages/History';
import Suitability from './pages/Suitability';
import ClientDetails from './pages/ClientDetails';
import SystemHistory from './pages/SystemHistory';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rota para a página inicial (redireciona para /login se não autenticado) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rota para login */}
      <Route path="/login" element={<Login />} />

      {/* Rota para registro */}
      <Route path="/register" element={<Register />} />

      {/* Rota para a página Home */}
      <Route path="/home" element={<Home />} />

      {/* Rota para a lista de clientes */}
      <Route path="/clients" element={<ClientsList />} />

      {/* Rota para o histórico */}
      <Route path="/history" element={<History />} />

      {/*Rota para o histórico do sistema */}
      <Route path="/system-history" element={<SystemHistory />} />

      {/* Rota para o formulário de suitability (adicionar/editar cliente) */}
      <Route path="/suitability" element={<Suitability />} />
      <Route path="/suitability/:clientId" element={<Suitability />} />

      {/* Rota para detalhes de um cliente específico */}
      <Route path="/client/:clientId" element={<ClientDetails />} />

      {/* Rota para páginas não encontradas (404) */}
      <Route path="*" element={<div>404 - Página não encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;