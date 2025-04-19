import React from 'react';
import './IAExplanation.css';

interface IAExplanationProps {
  text: string;
  isDarkMode: boolean;
}

const IAExplanation: React.FC<IAExplanationProps> = ({ text, isDarkMode }) => {
  // Função para formatar o texto
  const formatText = (text: string) => {
    // Substituir caracteres especiais
    let formattedText = text
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\t/g, '    ');

    // Dividir em seções
    const sections = formattedText.split(/\*\*(.*?)\*\*/g);
    
    return sections.map((section, index) => {
      if (index % 2 === 1) {
        // Seção de título
        return (
          <h3 key={index} className={`ia-section-title ${isDarkMode ? 'dark' : 'light'}`}>
            {section}
          </h3>
        );
      } else {
        // Seção de conteúdo
        const paragraphs = section.split('\n').filter(p => p.trim());
        return paragraphs.map((paragraph, pIndex) => (
          <p key={`${index}-${pIndex}`} className={`ia-paragraph ${isDarkMode ? 'dark' : 'light'}`}>
            {paragraph}
          </p>
        ));
      }
    });
  };

  return (
    <div className={`ia-explanation ${isDarkMode ? 'dark' : 'light'}`}>
      {formatText(text)}
    </div>
  );
};

export default IAExplanation; 