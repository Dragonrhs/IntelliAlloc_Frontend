import React from 'react';

interface QuestionFieldProps {
  type: 'text' | 'select' | 'checkbox';
  label: string;
  value: string | string[]; // Pode ser string ou array para checkboxes
  onChange: (value: string | string[]) => void;
  options?: string[];
  score?: number;
}

const QuestionField: React.FC<QuestionFieldProps> = ({ type, label, value, onChange, options }) => {
  if (type === 'select' && options) {
    return (
      <div>
        <label>{label}</label>
        <select value={value as string} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'checkbox' && options) {
    const handleCheckboxChange = (option: string) => {
      const currentValues = value as string[];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v) => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    };

    return (
      <div>
        <label>{label}</label>
        {options.map((option) => (
          <div key={option}>
            <input
              type="checkbox"
              checked={(value as string[]).includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            <label>{option}</label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default QuestionField;