import { useState } from 'react';
import { ShieldCheck, User, Lock, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [tipoAcesso, setTipoAcesso] = useState('usuario'); 
  const [saram, setSaram] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    // --- 🔑 CHAVE MESTRA TEMPORÁRIA (BACKDOOR) ---
    // (Vamos apagar isso assim que você cadastrar o primeiro usuário real)
    if (saram === 'admin' && senha === 'admin') {
      localStorage.setItem('sigem_perfil', 'escalante');
      window.location.href = '/dashboard';
      return; // O return faz ele parar aqui e não ir perguntar pro Java
    }
    // ---------------------------------------------

    try {
      // O React chama a rota que acabamos de colocar no Controller
      const resposta = await api.post('/militares/login', {
        saram: saram,
        senha: senha,
        perfil: tipoAcesso // A aba que está selecionada (usuario ou escalante)
      });

      if (resposta.status === 200) {
        localStorage.setItem('sigem_perfil', tipoAcesso);
        window.location.href = '/dashboard'; 
      }

    } catch (err) {
      // Se falhar, isso vai imprimir o motivo real no Console do navegador (F12)
      console.error("ERRO DE LOGIN:", err); 
      setErro('Acesso negado: SARAM, senha ou perfil incorretos.');
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        
        {/* ABAS DO TOPO (O controle de perfil) */}
        <div style={styles.tabContainer}>
          <button 
            type="button"
            onClick={() => { setTipoAcesso('usuario'); setErro(''); }}
            style={{...styles.tab, ...(tipoAcesso === 'usuario' ? styles.tabActive : styles.tabInactive)}}
          >
            Acesso da Tropa
          </button>
          <button 
            type="button"
            onClick={() => { setTipoAcesso('escalante'); setErro(''); }}
            style={{...styles.tab, ...(tipoAcesso === 'escalante' ? styles.tabActiveEscalante : styles.tabInactive)}}
          >
            Acesso do Escalante
          </button>
        </div>

        {/* CORPO DO LOGIN */}
        <div style={styles.formContainer}>
          <div style={styles.logoBox}>
            <ShieldCheck size={48} color={tipoAcesso === 'escalante' ? '#004d40' : '#003366'} />
            <h1 style={styles.title}>SIGEM</h1>
            <p style={styles.subtitle}>Sistema de Gestão de Escalas Militares</p>
          </div>

          {erro && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} /> {erro}
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <User size={18} color="#777" style={styles.icon} />
              <input 
                type="text" 
                placeholder="SARAM (Apenas números)" 
                value={saram} 
                onChange={(e) => setSaram(e.target.value)}
                style={styles.input}
                required 
              />
            </div>
            
            <div style={styles.inputGroup}>
              <Lock size={18} color="#777" style={styles.icon} />
              <input 
                type="password" 
                placeholder="Senha" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
                required 
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.submitBtn, backgroundColor: tipoAcesso === 'escalante' ? '#004d40' : '#003366'}}
            >
              ACESSAR SISTEMA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  loginCard: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', overflow: 'hidden' },
  tabContainer: { display: 'flex', width: '100%', borderBottom: '1px solid #e0e0e0' },
  tab: { flex: 1, padding: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', fontSize: '14px' },
  tabActive: { backgroundColor: '#fff', color: '#003366', borderBottom: '3px solid #003366' },
  tabActiveEscalante: { backgroundColor: '#fff', color: '#004d40', borderBottom: '3px solid #004d40' },
  tabInactive: { backgroundColor: '#f8f9fa', color: '#9e9e9e', borderBottom: '3px solid transparent' },
  formContainer: { padding: '40px 30px' },
  logoBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
  title: { margin: '10px 0 5px 0', color: '#002244', fontSize: '24px', letterSpacing: '1px' },
  subtitle: { margin: '0', color: '#666', fontSize: '12px', textTransform: 'uppercase' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '6px', padding: '0 15px', backgroundColor: '#fff' },
  icon: { marginRight: '10px' },
  input: { flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontSize: '15px', color: '#333' },
  submitBtn: { color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px', transition: 'opacity 0.2s' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', fontWeight: '500' }
};