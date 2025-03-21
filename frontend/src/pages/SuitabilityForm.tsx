import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QuestionField from '../components/Questionfield';

const SuitabilityForm: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [q1InvestmentDuration, setQ1InvestmentDuration] = useState('');
  const [q2InvestmentPurpose, setQ2InvestmentPurpose] = useState('');
  const [q3InvestmentAllocation, setQ3InvestmentAllocation] = useState('');
  const [q4FinancialExperience, setQ4FinancialExperience] = useState('');
  const [q5InvestmentOptions, setQ5InvestmentOptions] = useState<string[]>([]);
  const [q6Observations, setQ6Observations] = useState('');
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>(); // Pega o ID da URL

  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/clients`, {
            withCredentials: true,
          });
          const client = response.data.clients.find((c: any) => c.id === parseInt(clientId));
          if (client) {
            setClientName(client.client_name);
            setQ1InvestmentDuration(client.q1_investment_duration);
            setQ2InvestmentPurpose(client.q2_investment_purpose);
            setQ3InvestmentAllocation(client.q3_investment_allocation);
            setQ4FinancialExperience(client.q4_financial_experience);
            setQ5InvestmentOptions(client.q5_investment_options);
            setQ6Observations(client.q6_observations || '');
          }
        } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          alert('Erro ao carregar cliente');
        }
      };
      fetchClient();
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      client_name: clientName,
      q1_investment_duration: q1InvestmentDuration,
      q2_investment_purpose: q2InvestmentPurpose,
      q3_investment_allocation: q3InvestmentAllocation,
      q4_financial_experience: q4FinancialExperience,
      q5_investment_options: q5InvestmentOptions,
      q6_observations: q6Observations,
    };

    try {
      if (clientId) {
        await axios.put(`http://localhost:5000/client/${clientId}`, data, {
          withCredentials: true,
        });
        alert('Cliente atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:5000/add-client', data, {
          withCredentials: true,
        });
        alert('Cliente adicionado com sucesso!');
      }
      navigate('/home');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const handleDelete = async () => {
    if (clientId && window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:5000/client/${clientId}`, {
          withCredentials: true,
        });
        alert('Cliente excluído com sucesso!');
        navigate('/home');
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente');
      }
    }
  };

  return (
    <div>
      <h2>{clientId ? 'Editar Suitability' : 'Suitability - Adicionar Cliente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome do Cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <QuestionField
          type="select"
          label="1. Por quanto tempo pretende manter os seus investimentos?"
          value={q1InvestmentDuration}
          onChange={(value) => setQ1InvestmentDuration(Array.isArray(value) ? value.join(', ') : value)}
          options={['Até 1 ano', 'De 1 a 3 anos', 'De 3 a 5 anos', 'Acima de 5 anos']}
          score={20}
        />
        <QuestionField
          type="select"
          label="2. Qual é a finalidade do investimento realizado ou a ser realizado?"
          value={q2InvestmentPurpose}
          onChange={(value) => setQ2InvestmentPurpose(Array.isArray(value) ? value.join(', ') : value)}
          options={[
            'Preservação de patrimônio',
            'Obter retornos superiores às aplicações tradicionais, tolerando pequenas perdas de parte do patrimônio no curto prazo',
            'Obter retornos superiores às aplicações tradicionais, tolerando possíveis perdas significativas de parte do patrimônio no médio prazo',
            'Crescimento substancial do patrimônio no longo prazo, mesmo que a estratégia possa implicar em perdas expressivas dos recursos investidos'
          ]}
          score={20}
        />
        <QuestionField
          type="select"
          label="3. Quanto do patrimônio geralmente destina para investimentos financeiros?"
          value={q3InvestmentAllocation}
          onChange={(value) => setQ3InvestmentAllocation(Array.isArray(value) ? value.join(', ') : value)}
          options={['Menos de 25%', 'De 25% a 50%', 'De 50% a 75%', 'Acima de 75%']}
          score={20}
        />
        <QuestionField
          type="select"
          label="4. Como classificaria a experiência no mercado financeiro?"
          value={q4FinancialExperience}
          onChange={(value) => setQ4FinancialExperience(Array.isArray(value) ? value.join(', ') : value)}
          options={[
            'Não possui nenhuma experiência',
            'Pouca experiência em investimentos em geral',
            'Experiência com investimentos com pouca/média probabilidade de perda',
            'Se sente seguro em tomar decisões de investimentos e esta apto a entender e ponderar os riscos'
          ]}
          score={20}
        />
        <QuestionField
          type="checkbox"
          label="5. Indique se possui experiência nas seguintes opções de investimentos:"
          value={q5InvestmentOptions}
          onChange={(value) => setQ5InvestmentOptions(Array.isArray(value) ? value : [value])}
          options={[
            'Ações',
            'Derivativos/Estruturados',
            'Fundos de Investimentos de Ações e Multimercados',
            'Fundos de Investimentos de Renda Fixa',
            'CDB',
            'Previdência',
            'Títulos Públicos',
            'Imóveis',
            'Poupança',
            'Não realiza investimentos'
          ]}
          score={20}
        />
        <QuestionField
          type="text"
          label="6. Alguma observação ou restrição?"
          value={q6Observations}
          onChange={(value) => setQ6Observations(Array.isArray(value) ? value.join(', ') : value)}
          score={0}
        />
        <button type="submit">{clientId ? 'Atualizar' : 'Salvar'} Cliente</button>
        {clientId && (
          <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
            Excluir Cliente
          </button>
        )}
        <button type="button" onClick={() => navigate('/home')} style={{ marginLeft: '10px' }}>
          Voltar
        </button>
      </form>
    </div>
  );
};

export default SuitabilityForm;