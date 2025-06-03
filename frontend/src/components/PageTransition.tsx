import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    showLoading('Carregando página...');

    // Função para esconder o loading quando a página estiver pronta
    const handlePageLoad = () => {
      if (isMounted.current) {
        hideLoading();
      }
    };

    // Adiciona um timeout de segurança de 2 segundos
    const safetyTimeout = setTimeout(() => {
      if (isMounted.current) {
        hideLoading();
      }
    }, 2000);

    // Verifica se a página já está carregada
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      // Adiciona o listener para quando a página terminar de carregar
      window.addEventListener('load', handlePageLoad);
    }

    return () => {
      isMounted.current = false;
      window.removeEventListener('load', handlePageLoad);
      clearTimeout(safetyTimeout);
      hideLoading();
    };
  }, [location.pathname, showLoading, hideLoading]);

  return <>{children}</>;
};

export default PageTransition; 