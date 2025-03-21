import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SuitabilityForm from './pages/SuitabilityForm';

const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/suitability" element={<SuitabilityForm />} />
      <Route path="/suitability/:clientId" element={<SuitabilityForm />} /> {/* Rota para edição */}
    </Routes>
  </Router>
);

export default AppRoutes;