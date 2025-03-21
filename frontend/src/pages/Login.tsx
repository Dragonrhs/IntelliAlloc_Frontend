import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomCard from "../components/CustomCard";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagem de erro
  const [loading, setLoading] = useState(false); // Estado para a tela de carregamento
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage(""); // Limpa mensagem de erro antes de tentar login

    try {
      await axios.post(
        "http://localhost:5000/login",
        { username, password },
        { withCredentials: true }
      );

      // Exibe a tela de carregamento
      setLoading(true);

      setTimeout(() => {
        navigate("/home"); // Redireciona após 2 segundos
      }, 2000);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage("Usuário ou senha incorretos.");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      ) : (
        <div className="login-form">
          <h2 className="login-title">
            Faça seu login<span className="dot">.</span>
          </h2>
          <CustomCard className="login-card">
            <CustomInput
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label="Usuário"
              className="input-neon"
            />
            <CustomInput
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Senha"
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mensagem de erro */}
            <CustomButton text="Entrar" onClick={handleLogin} className="login-button" />
          </CustomCard>
          <p className="register-text">
            Ainda não tem uma conta?{" "}
            <a href="#" className="register-link" onClick={handleRegisterRedirect}>
              Criar conta
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
