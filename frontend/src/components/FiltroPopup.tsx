import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './FiltroPopup.css';

interface FiltroPopupProps {
  coluna: string;
  valores: any[];
  filtrosAtivos: string[];
  isDarkMode: boolean;
  onAplicarFiltro: (valores: string[]) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const FiltroPopup: React.FC<FiltroPopupProps> = ({
  coluna,
  valores,
  filtrosAtivos,
  isDarkMode,
  onAplicarFiltro,
  onClose,
  buttonRef
}) => {
  const [pesquisa, setPesquisa] = useState('');
  const [valoresSelecionados, setValoresSelecionados] = useState<string[]>(filtrosAtivos);
  const [ordenacao, setOrdenacao] = useState<'asc' | 'desc' | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Remove duplicatas e valores nulos/undefined e adiciona opção vazia se existirem valores nulos
  const valoresUnicos = Array.from(new Set(valores.filter(v => v !== null && v !== undefined && v !== '')))
    .sort((a, b) => String(a).localeCompare(String(b)));
  
  // Adiciona opção vazia se existirem valores nulos ou vazios
  if (valores.some(v => v === null || v === undefined || v === '' || v === '-')) {
    valoresUnicos.unshift('-');
  }

  const valoresFiltrados = valoresUnicos.filter(valor =>
    String(valor).toLowerCase().includes(pesquisa.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSelectAll = () => {
    if (valoresSelecionados.length === valoresUnicos.length) {
      setValoresSelecionados([]);
    } else {
      setValoresSelecionados(valoresUnicos.map(v => String(v)));
    }
  };

  const handleToggleValor = (valor: string) => {
    setValoresSelecionados(prev =>
      prev.includes(valor)
        ? prev.filter(v => v !== valor)
        : [...prev, valor]
    );
  };

  const handleAplicarFiltro = () => {
    // Se houver texto na pesquisa, seleciona todos os itens filtrados
    if (pesquisa.trim() !== '') {
      const valoresFiltrados = valoresUnicos.filter(valor =>
        String(valor).toLowerCase().includes(pesquisa.toLowerCase())
      );
      onAplicarFiltro(valoresFiltrados.map(v => String(v)));
    } else {
      // Se o valor vazio ('-') estiver selecionado, inclui null, undefined e string vazia
      const valoresFiltrados = valoresSelecionados.includes('-') 
        ? [...valoresSelecionados.filter(v => v !== '-'), null, undefined, '', '-']
        : valoresSelecionados;
      onAplicarFiltro(valoresFiltrados.map(v => String(v)));
    }
    onClose();
  };

  const handleLimparFiltro = () => {
    setValoresSelecionados([]);
    onAplicarFiltro([]);
    onClose();
  };

  const handleOrdenar = (tipo: 'asc' | 'desc') => {
    setOrdenacao(tipo);
    onAplicarFiltro(valoresSelecionados);
    onClose();
  };

  return createPortal(
    <>
      <div 
        className="filtro-popup-overlay" 
        onClick={onClose}
      />
      <div 
        ref={popupRef}
        className={`filtro-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="filtro-header">
          <h3>Filtrar {coluna}</h3>
          <div 
            className="ordenacao-buttons" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => handleOrdenar('asc')}
              className={ordenacao === 'asc' ? 'active' : ''}
            >
              ↑ A-Z
            </button>
            <button 
              onClick={() => handleOrdenar('desc')}
              className={ordenacao === 'desc' ? 'active' : ''}
            >
              ↓ Z-A
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Pesquisar..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="filtro-search"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        />

        <div 
          className="filtro-options" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <label className="filtro-checkbox-item">
            <input
              type="checkbox"
              checked={valoresSelecionados.length === valoresUnicos.length}
              onChange={handleSelectAll}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
            <span>Selecionar Todos</span>
          </label>

          <div className="filtro-valores-list">
            {valoresFiltrados.map((valor) => (
              <label key={String(valor)} className="filtro-checkbox-item">
                <input
                  type="checkbox"
                  checked={valoresSelecionados.includes(String(valor))}
                  onChange={() => handleToggleValor(String(valor))}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                />
                <span>{valor}</span>
              </label>
            ))}
          </div>
        </div>

        <div 
          className="filtro-actions" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button onClick={handleLimparFiltro}>Limpar</button>
          <button onClick={handleAplicarFiltro} className="aplicar">Aplicar</button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default FiltroPopup; 