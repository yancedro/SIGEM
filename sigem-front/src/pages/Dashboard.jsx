import { useState, useEffect } from 'react';
import { LogOut, Calendar, Hash, ShieldCheck, ShieldAlert } from 'lucide-react';
import PainelUsuario from './PainelUsuario';
import PainelAdmin from './PainelAdmin';

function Dashboard() {
  const [perfilAtivo, setPerfilAtivo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('escalas');

  // Verifica quem logou assim que a tela abre
  useEffect(() => {
    const perfilSalvo = localStorage.getItem('sigem_perfil');
    if (!perfilSalvo) {
      // Se não tem login, chuta de volta para a tela inicial
      window.location.href = '/'; 
    } else {
      setPerfilAtivo(perfilSalvo);
      // Se for escalante, já abre a tela dele por padrão. Se for usuário, abre a da tropa.
      setAbaAtiva(perfilSalvo === 'escalante' ? 'admin' : 'escalas');
    }
  }, []);

  const handleSair = () => {
    localStorage.removeItem('sigem_perfil');
    window.location.href = '/';
  };

  if (!perfilAtivo) return null; // Evita piscar a tela antes de redirecionar

  return (
    <div style={styles.container}>
      {/* MENU LATERAL INTELIGENTE */}
      <nav style={{...styles.sidebar, backgroundColor: perfilAtivo === 'escalante' ? '#002b24' : '#002244'}}>
        <div style={styles.logoContainer}>
          <ShieldCheck size={40} color={perfilAtivo === 'escalante' ? '#4db6ac' : '#64b5f6'} />
          <h2 style={styles.logo}>SIGEM</h2>
          <span style={styles.badgePerfil}>{perfilAtivo === 'escalante' ? 'ESCALANTE' : 'TROPA'}</span>
        </div>
        
        <div style={styles.menu}>
          {/* MENU EXCLUSIVO DO USUÁRIO DA TROPA */}
          {perfilAtivo === 'usuario' && (
            <>
              <span style={styles.secaoLabel}>Visão da Tropa</span>
              <div onClick={() => setAbaAtiva('escalas')} style={{...styles.menuItem, backgroundColor: abaAtiva === 'escalas' ? '#1a4d80' : 'transparent'}}>
                <Calendar size={20} /> Escalas Mensais
              </div>
              <div onClick={() => setAbaAtiva('quadrinhos')} style={{...styles.menuItem, backgroundColor: abaAtiva === 'quadrinhos' ? '#1a4d80' : 'transparent'}}>
                <Hash size={20} /> Fatores / Quadrinhos
              </div>
            </>
          )}
          
          {/* MENU EXCLUSIVO DO ADMINISTRADOR */}
          {perfilAtivo === 'escalante' && (
            <>
              <span style={{...styles.secaoLabel, color: '#4db6ac'}}>Gestão de Comando</span>
              <div onClick={() => setAbaAtiva('admin')} style={{...styles.menuItem, backgroundColor: abaAtiva === 'admin' ? '#004d40' : 'transparent'}}>
                <ShieldAlert size={20} /> Painel Administrativo
              </div>
              <div onClick={() => setAbaAtiva('escalas')} style={{...styles.menuItem, backgroundColor: abaAtiva === 'escalas' ? '#004d40' : 'transparent'}}>
                <Calendar size={20} /> Visão da Tropa (Espelho)
              </div>
            </>
          )}
        </div>

        <button onClick={handleSair} style={styles.logoutBtn}>
          <LogOut size={20} /> Sair
        </button>
      </nav>

      {/* ÁREA CENTRAL DINÂMICA */}
      <main style={styles.content}>
        {abaAtiva === 'escalas' && <PainelUsuario abaAberta="escalas" />}
        {abaAtiva === 'quadrinhos' && <PainelUsuario abaAberta="quadrinhos" />}
        {abaAtiva === 'admin' && <PainelAdmin />}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f4f6f8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  sidebar: { width: '260px', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px', transition: 'background-color 0.3s' },
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
  logo: { margin: 0, letterSpacing: '2px', fontSize: '24px' },
  badgePerfil: { fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '10px', letterSpacing: '1px' },
  menu: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  secaoLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64b5f6', textTransform: 'uppercase', padding: '15px 16px 5px 16px', letterSpacing: '1px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '6px', color: '#e0e0e0', fontWeight: '500', fontSize: '14px', transition: '0.2s' },
  logoutBtn: { backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontWeight: 'bold', marginTop: 'auto' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' }
};

export default Dashboard;