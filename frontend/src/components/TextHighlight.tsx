import React from 'react';

interface TextHighlightProps {
  text: string | number | null;
  searchTerm: string;
}

const TextHighlight: React.FC<TextHighlightProps> = ({ text, searchTerm }) => {
  if (text === null || text === undefined) return <>-</>;
  
  const str = String(text);
  if (!searchTerm) return <>{str}</>;

  const parts = str.split(new RegExp(`(${searchTerm})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className="highlight-text">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default TextHighlight; 