import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';

const authConfig = { auth: { username: '123456789', password: '123' } };
const nomeMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function PainelUsuario({ abaAberta }) {
  const [listaEscalas, setListaEscalas] = useState([]); 
  const [erro, setErro] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(''); 
  const [escalaIdSelecionada, setEscalaIdSelecionada] = useState(''); 
  const [dadosEscalaMensal, setDadosEscalaMensal] = useState(null); 
  const [anoQuadrinho, setAnoQuadrinho] = useState('');
  const [servicoQuadrinho, setServicoQuadrinho] = useState('');
  const [dadosQuadrinhos, setDadosQuadrinhos] = useState([]); 

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        const response = await api.get(`/escalas?_cb=${new Date().getTime()}`, authConfig);
        if (response.data && response.data.length > 0) {
          setListaEscalas(response.data);
          const meses = [...new Set(response.data.map(e => e.mes))].sort((a, b) => a - b);
          const anos = [...new Set(response.data.map(e => e.ano))].sort((a, b) => b - a);
          if (meses.length > 0) setMesSelecionado(meses[0].toString());
          if (anos.length > 0) setAnoQuadrinho(anos[0].toString());
        }
      } catch (err) {
        setErro('Falha ao conectar com o servidor.');
      }
    };
    carregarTudo();
  }, []);

  useEffect(() => {
    if (mesSelecionado && listaEscalas.length > 0) {
      const escalasDoMes = listaEscalas.filter(e => e.mes.toString() === mesSelecionado);
      if (escalasDoMes.length > 0) setEscalaIdSelecionada(escalasDoMes[0].id.toString());
      else { setEscalaIdSelecionada(''); setDadosEscalaMensal(null); }
    }
  }, [mesSelecionado, listaEscalas]);

  useEffect(() => {
    const carregarEscala = async () => {
      if (!escalaIdSelecionada) return;
      try {
        const response = await api.get(`/escalas/${escalaIdSelecionada}?_cb=${new Date().getTime()}`, authConfig);
        setDadosEscalaMensal(response.data);
      } catch (err) {}
    };
    if (abaAberta === 'escalas') carregarEscala();
  }, [escalaIdSelecionada, abaAberta]);

  useEffect(() => {
    const buscarEstatisticas = async () => {
      if (!anoQuadrinho || !servicoQuadrinho) return setDadosQuadrinhos([]);
      try {
        const response = await api.get(`/escalas/estatisticas?ano=${anoQuadrinho}&servico=${servicoQuadrinho}`, authConfig);
        setDadosQuadrinhos(response.data);
      } catch (err) {}
    };
    if (abaAberta === 'quadrinhos') buscarEstatisticas();
  }, [anoQuadrinho, servicoQuadrinho, abaAberta]);

  const servicosUnicos = Array.from(new Set(listaEscalas.map(e => e.servico?.nome))).filter(Boolean);
  const mesesDisponiveis = [...new Set(listaEscalas.map(e => e.mes))].sort((a, b) => a - b);
  const escalasDoMesFiltro = listaEscalas.filter(e => e.mes.toString() === mesSelecionado);
  const anosDisponiveis = [...new Set(listaEscalas.map(e => e.ano))].sort((a, b) => b - a);

  return (
    <div>
      {abaAberta === 'escalas' && (
        <div>
          <h1 style={styles.tituloSecao}>Consulta de Escalas Mensais</h1>
          <div style={styles.filterCard}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Filtro de Mês:</label>
              <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} style={styles.select}>
                {mesesDisponiveis.map(mes => <option key={mes} value={mes}>{nomeMeses[mes]} (Mês {mes})</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Filtro de Escala:</label>
              <select value={escalaIdSelecionada} onChange={(e) => setEscalaIdSelecionada(e.target.value)} style={styles.select} disabled={!mesSelecionado}>
                {escalasDoMesFiltro.map(esc => <option key={esc.id} value={esc.id}>{esc.servico?.nome} ({esc.tipo})</option>)}
              </select>
            </div>
          </div>
          {erro && <div style={styles.errorBox}><AlertTriangle size={20} /> {erro}</div>}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Militar Escalado</th>
                  <th style={styles.th}>Serviço</th>
                  <th style={styles.th}>Situação da Escala</th>
                </tr>
              </thead>
              <tbody>
                {dadosEscalaMensal?.itens?.length > 0 ? (
                  [...dadosEscalaMensal.itens].sort((a, b) => new Date(a.data) - new Date(b.data)).map((item, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={{...styles.td, fontWeight: 'bold'}}>{item.data.split('-').reverse().join('/')}</td>
                      <td style={styles.td}>{item.militar ? `${item.militar.graduacao} ${item.militar.nomeGuerra}` : 'Militar'}</td>
                      <td style={styles.td}>{dadosEscalaMensal.servico?.nome}</td>
                      <td style={styles.td}><span style={styles.badge}>{dadosEscalaMensal.tipo}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr style={styles.tr}><td colSpan="4" style={styles.tdVazio}>Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {abaAberta === 'quadrinhos' && (
        <div>
          <h1 style={styles.tituloSecao}>Painel Anual de Fatores e Quadrinhos</h1>
          <div style={styles.filterCard}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Ano de Referência:</label>
              <select value={anoQuadrinho} onChange={(e) => setAnoQuadrinho(e.target.value)} style={styles.select}>
                {anosDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Selecione o Serviço:</label>
              <select value={servicoQuadrinho} onChange={(e) => setServicoQuadrinho(e.target.value)} style={styles.select}>
                <option value="">Selecione...</option>
                {servicosUnicos.map((servico, index) => <option key={index} value={servico}>{servico}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Militar</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Quadrinhos Pretos</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Quadrinhos Vermelhos</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Fator Total</th>
                </tr>
              </thead>
              <tbody>
                {dadosQuadrinhos.length > 0 ? (
                  dadosQuadrinhos.map((dado, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{dado.graduacao} {dado.nomeGuerra}</td>
                      <td style={{...styles.td, textAlign: 'center', color: '#424242', fontWeight: 'bold'}}>{dado.pretos}</td>
                      <td style={{...styles.td, textAlign: 'center', color: '#d32f2f', fontWeight: 'bold'}}>{dado.vermelhos}</td>
                      <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}>{dado.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr style={styles.tr}><td colSpan="4" style={styles.tdVazio}>Selecione o serviço para consultar os dados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tituloSecao: { color: '#003366', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' },
  filterCard: { display: 'flex', gap: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', marginBottom: '25px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '250px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { padding: '12px', borderRadius: '6px', border: '1px solid #ccd0d5', fontSize: '15px', outline: 'none', backgroundColor: '#f9fafa', color: '#333' },
  tableContainer: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' },
  th: { padding: '16px', color: '#495057', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '16px', color: '#333', fontSize: '15px' },
  tdVazio: { textAlign: 'center', padding: '40px', color: '#777' },
  badge: { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
};