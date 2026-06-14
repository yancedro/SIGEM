import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from './services/api';
import { Lock, User, ShieldCheck } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState(''); 
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      // Enviamos o CPF e Senha usando Basic Auth para o seu Java
      const response = await api.get('/escalas', {
        auth: {
          username: cpf,
          password: senha
        }
      });

      if (response.status === 200) {
        navigate('/dashboard');
        // Aqui redirecionaremos para a Dashboard
      }
      // Se o status não for 200, consideramos como erro de autenticação
    // eslint-disable-next-line no-unused-vars
    } catch (erro) {
      setErro('CPF ou Senha inválidos. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <ShieldCheck size={48} color="#003366" />
          <h1 style={styles.title}>SIGEM</h1>
          <p style={styles.subtitle}>Sistema de Gestão de Escalas Militares</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={20} style={styles.icon} />
            <input
              type="text"
              placeholder="CPF (apenas números)"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {erro && <p style={styles.error}>{erro}</p>}

          <button type="submit" style={styles.button}>
            ACESSAR SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos básicos para o seu TCC ficar com boa aparência
const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  loginCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  header: { marginBottom: '30px' },
  title: { fontSize: '28px', color: '#003366', margin: '10px 0 5px 0' },
  subtitle: { fontSize: '14px', color: '#666' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' },
  icon: { marginRight: '10px', color: '#666' },
  input: { border: 'none', outline: 'none', width: '100%', fontSize: '16px' },
  button: { backgroundColor: '#003366', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: 'red', fontSize: '14px', margin: '0' }
};

export default App;