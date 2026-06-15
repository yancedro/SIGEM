import { useState, useEffect } from 'react';
import { UserPlus, CalendarPlus, CalendarRange, BarChart3, ShieldAlert, Flag, Zap, PlusCircle } from 'lucide-react';
import api from '../services/api';

const authConfig = { auth: { username: '123456789', password: '123' } };
const nomeMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function PainelAdmin() {
  const [subAba, setSubAba] = useState('escalar');
  const [listaEscalas, setListaEscalas] = useState([]);
  const [mesFiltro, setMesFiltro] = useState('');
  const [escalaIdSelecionada, setEscalaIdSelecionada] = useState('');
  const [dadosEscala, setDadosEscala] = useState(null);

  // Forms
  const [formMilitar, setFormMilitar] = useState({ nomeCompleto: '', nomeGuerra: '', graduacao: 'Soldado', saram: '', telefone: '' });
  const [formEscala, setFormEscala] = useState({ mes: '1', ano: '2026', tipo: 'PROVISÓRIA', servicoId: '1' });

  useEffect(() => {
    const carregarEscalasCapa = async () => {
      try {
        const res = await api.get(`/escalas?_cb=${new Date().getTime()}`, authConfig);
        if (res.data && res.data.length > 0) {
          setListaEscalas(res.data);
          const meses = [...new Set(res.data.map(e => e.mes))].sort((a, b) => a - b);
          if (meses.length > 0) setMesFiltro(meses[0].toString());
        }
      } catch (err) {}
    };
    carregarEscalasCapa();
  }, []);

  useEffect(() => {
    if (mesFiltro && listaEscalas.length > 0) {
      const filtradas = listaEscalas.filter(e => e.mes.toString() === mesFiltro);
      if (filtradas.length > 0) setEscalaIdSelecionada(filtradas[0].id.toString());
      else { setEscalaIdSelecionada(''); setDadosEscala(null); }
    }
  }, [mesFiltro, listaEscalas]);

  const carregarItensEscala = async () => {
    if (!escalaIdSelecionada) return;
    try {
      const res = await api.get(`/escalas/${escalaIdSelecionada}?_cb=${new Date().getTime()}`, authConfig);
      setDadosEscala(res.data);
    } catch (err) {}
  };

  useEffect(() => { carregarItensEscala(); }, [escalaIdSelecionada]);

  const handleAlternarFeriado = async (itemId) => {
    try {
      await api.patch(`/escalas/itens/${itemId}/alternar-feriado`, {}, authConfig);
      carregarItensEscala();
    } catch (err) { alert("Erro ao alternar feriado no servidor."); }
  };

  const handleGerarAutomatica = async () => {
    if (!escalaIdSelecionada) return;
    try {
      await api.post(`/${escalaIdSelecionada}/gerar-automatica`, {}, authConfig);
      alert("Escala gerada automaticamente com sucesso!");
      carregarItensEscala();
    } catch (err) { alert("Falha na geração automática."); }
  };

  const escalasFiltradas = listaEscalas.filter(e => e.mes.toString() === mesFiltro);

  return (
    <div style={styles.container}>
      <div style={styles.topMenu}>
        <button onClick={() => setSubAba('cadastro')} style={{...styles.tabBtn, borderBottomColor: subAba === 'cadastro' ? '#004d40' : 'transparent'}}>
          <UserPlus size={18} /> Cadastrar Tropa
        </button>
        <button onClick={() => setSubAba('criar-capa')} style={{...styles.tabBtn, borderBottomColor: subAba === 'criar-capa' ? '#004d40' : 'transparent'}}>
          <CalendarPlus size={18} /> Abertura de Mês
        </button>
        <button onClick={() => setSubAba('escalar')} style={{...styles.tabBtn, borderBottomColor: subAba === 'escalar' ? '#004d40' : 'transparent'}}>
          <CalendarRange size={18} /> Alocação Operacional
        </button>
        <button onClick={() => setSubAba('lastros')} style={{...styles.tabBtn, borderBottomColor: subAba === 'lastros' ? '#004d40' : 'transparent'}}>
          <BarChart3 size={18} /> Lastros
        </button>
      </div>

      <div style={styles.innerContent}>
        {subAba === 'escalar' && (
          <div>
            <div style={styles.filterInline}>
              <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} style={styles.select}>
                {[...new Set(listaEscalas.map(e => e.mes))].map(m => <option key={m} value={m}>{nomeMeses[m]}</option>)}
              </select>
              <select value={escalaIdSelecionada} onChange={(e) => setEscalaIdSelecionada(e.target.value)} style={styles.select}>
                {escalasFiltradas.map(esc => <option key={esc.id} value={esc.id}>{esc.servico?.nome}</option>)}
              </select>
              <button onClick={handleGerarAutomatica} style={styles.btnZap} disabled={!escalaIdSelecionada}>
                <Zap size={16}/> Gerar Escala Automática
              </button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Militar Alocado</th>
                    <th style={styles.th}>Controle de Feriado</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosEscala?.itens?.length > 0 ? (
                    [...dadosEscala.itens].sort((a,b) => new Date(a.data) - new Date(b.data)).map((item, idx) => {
                      const isFeriado = item.isFeriadoManual === true;
                      return (
                        <tr key={idx} style={styles.tr}>
                          <td style={{...styles.td, fontWeight: 'bold'}}>{item.data.split('-').reverse().join('/')}</td>
                          <td style={styles.td}>{item.militar ? `${item.militar.graduacao} ${item.militar.nomeGuerra}` : 'Vago'}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleAlternarFeriado(item.id)} style={{...styles.btnFeriado, backgroundColor: isFeriado ? '#ffebee' : '#f5f5f5', color: isFeriado ? '#d32f2f' : '#616161', border: isFeriado ? '1px solid #ef9a9a' : '1px solid #e0e0e0'}}>
                              <Flag size={14} fill={isFeriado ? '#d32f2f' : 'none'}/> {isFeriado ? 'Desmarcar Feriado' : 'Tornar Vermelha'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan="3" style={styles.tdVazio}>Selecione uma escala.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subAba === 'cadastro' && (
          <div style={styles.formCard}>
            <h3>Módulo em Desenvolvimento</h3>
            <p>Os formulários de inclusão de militares serão conectados à API em breve.</p>
          </div>
        )}
        
        {subAba === 'criar-capa' && (
          <div style={styles.formCard}>
             <h3>Módulo em Desenvolvimento</h3>
             <p>A interface para gerar a estrutura mensal vazia (Capa) entrará aqui.</p>
          </div>
        )}

        {subAba === 'lastros' && (
          <div style={styles.formCard}>
             <h3 style={{color: '#f57f17'}}><ShieldAlert size={20}/> Ajustes Manuais de Quadrinhos</h3>
             <p>Painel de auditoria do escalante para militares transferidos ou recém chegados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', border: '2px solid #004d40' },
  topMenu: { display: 'flex', gap: '15px', borderBottom: '2px solid #e9ecef', marginBottom: '25px' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '3px solid transparent', fontSize: '15px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  innerContent: { minHeight: '350px' },
  formCard: { background: '#fafafa', padding: '25px', borderRadius: '8px', border: '1px solid #eef0f2' },
  filterInline: { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' },
  select: { padding: '10px', borderRadius: '6px', border: '1px solid #dee2e6', minWidth: '180px' },
  btnZap: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e0f2f1', color: '#004d40', border: '1px solid #80cbc4', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  tableContainer: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#e0f2f1' },
  th: { padding: '14px', color: '#004d40', fontSize: '13px', textTransform: 'uppercase', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px', color: '#334155', fontSize: '15px' },
  tdVazio: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  btnFeriado: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }
};