import { useState, useEffect } from 'react';
import { UserPlus, CalendarPlus, CalendarRange, BarChart3, ShieldAlert, Flag, Zap, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const authConfig = { auth: { username: '123456789', password: '123' } };
const nomeMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function PainelAdmin() {
  const [subAba, setSubAba] = useState('escalar');
  const [listaEscalas, setListaEscalas] = useState([]);
  const [mesFiltro, setMesFiltro] = useState('');
  const [escalaIdSelecionada, setEscalaIdSelecionada] = useState('');
  const [dadosEscala, setDadosEscala] = useState(null);

  // Form Militar cadastro
  // 1. Estado do formulário para cadastro de usuario
  
  const [formMilitar, setFormMilitar] = useState({ 
    nomeCompleto: '', 
    nomeGuerra: '', 
    graduacao: 'S2', 
    saram: '', 
    cpf: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    senha: '',
    perfil: 'usuario'
  });
  // MÁSCARA DE CPF: Transforma "12345678900" em "123.456.789-00"
  const aplicarMascaraCPF = (valor) => {
    return valor
      .replace(/\D/g, '') // Remove tudo o que não for número
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o primeiro ponto
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o segundo ponto
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca o traço
      .replace(/(-\d{2})\d+?$/, '$1'); // Trava no limite máximo de 14 caracteres
  };

  // MÁSCARA DE SARAM: Permite apenas números e trava em 7 dígitos exatos
  const aplicarMascaraSaram = (valor) => {
    return valor
      .replace(/\D/g, '') // Remove letras e símbolos
      .slice(0, 7); // Trava no máximo de 7 caracteres
  };

  // NOVO ESTADO: Controle da mensagem na tela
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // FUNÇÃO INTELIGENTE: Mostra a mensagem e apaga ela sozinha após 5 segundos
  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem({ texto: '', tipo: '' });
    }, 5000);
  };

  const handleCadastrarMilitar = async (e) => {
    e.preventDefault();

    // TRAVAS DE SEGURANÇA
    if (formMilitar.saram.length !== 7) {
      mostrarMensagem("Ação negada: O SARAM deve conter exatamente 7 dígitos numéricos.", "erro");
      return;
    }
    if (formMilitar.cpf.length !== 14) {
      mostrarMensagem("Ação negada: O CPF está incompleto ou inválido.", "erro");
      return;
    }

    try {
      await api.post('/militares', formMilitar, authConfig);
      
      mostrarMensagem(`Militar ${formMilitar.graduacao} ${formMilitar.nomeGuerra} cadastrado com sucesso!`, "sucesso");
      
      // Limpa os campos após salvar
      setFormMilitar({ 
        nomeCompleto: '', nomeGuerra: '', graduacao: 'S2', saram: '', 
        cpf: '', email: '', telefone: '', dataNascimento: '', 
        senha: '', perfil: 'usuario' 
      });
    } catch (err) {
      console.error(err);
      // Puxa a mensagem de erro que veio do Spring Boot (se existir), ou mostra a genérica
      const mensagemDoServidor = typeof err.response?.data === 'string' 
          ? err.response.data 
          : "Erro interno no servidor Java. Verifique o console do IntelliJ.";
          
      mostrarMensagem(mensagemDoServidor, "erro");
    }
  };
  
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
  // Altera o dia para vermelho
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
          <form onSubmit={handleCadastrarMilitar} style={styles.formCard}>
            <h3 style={{ color: '#004d40', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>
              Inclusão de Novo Militar no Efetivo
            </h3>

            {/* CAIXA DE MENSAGEM DINÂMICA */}
            {mensagem.texto && (
              <div style={mensagem.tipo === 'erro' ? styles.msgErro : styles.msgSucesso}>
                {mensagem.tipo === 'erro' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                <span>{mensagem.texto}</span>
              </div>
            )}
            
            <div style={styles.formGrid}></div>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Nome Completo</label>
                <input type="text" required value={formMilitar.nomeCompleto} onChange={e => setFormMilitar({...formMilitar, nomeCompleto: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Nome de Guerra</label>
                <input type="text" required value={formMilitar.nomeGuerra} onChange={e => setFormMilitar({...formMilitar, nomeGuerra: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Posto / Graduação</label>
                <select value={formMilitar.graduacao} onChange={e => setFormMilitar({...formMilitar, graduacao: e.target.value})} style={styles.input}>
                  <option value="S2">S2 (Soldado de 2ª Classe)</option>
                  <option value="S1">S1 (Soldado de 1ª Classe)</option>
                  <option value="CB">CB (Cabo)</option>
                  <option value="3S">3S (Terceiro Sargento)</option>
                  <option value="2S">2S (Segundo Sargento)</option>
                  <option value="1S">1S (Primeiro Sargento)</option>
                  <option value="SO">SO (Suboficial)</option>
                  <option value="2T">2T (Segundo Tenente)</option>
                  <option value="1T">1T (Primeiro Tenente)</option>
                  <option value="CAP">CAP (Capitão)</option>
                  <option value="MAJ">MAJ (Major)</option>
                  <option value="TC">TC (Tenente-Coronel)</option>
                </select>
              </div>

             <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>SARAM (Login)</label>
                <input 
                  type="text" // Mudou de "number" para "text" para a máscara funcionar bem
                  required 
                  placeholder="Ex: 1234567" 
                  value={formMilitar.saram} 
                  onChange={e => setFormMilitar({...formMilitar, saram: aplicarMascaraSaram(e.target.value)})} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>CPF</label>
                <input 
                  type="text" 
                  required 
                  placeholder="000.000.000-00" 
                  value={formMilitar.cpf} 
                  onChange={e => setFormMilitar({...formMilitar, cpf: aplicarMascaraCPF(e.target.value)})} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>E-mail</label>
                <input type="email" required placeholder="nome@unidade.mil" value={formMilitar.email} onChange={e => setFormMilitar({...formMilitar, email: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Telefone</label>
                <input type="tel" required placeholder="(XX) 9XXXX-XXXX" value={formMilitar.telefone} onChange={e => setFormMilitar({...formMilitar, telefone: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Data de Nascimento</label>
                <input type="date" required value={formMilitar.dataNascimento} onChange={e => setFormMilitar({...formMilitar, dataNascimento: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Senha de Acesso</label>
                <input type="password" required value={formMilitar.senha} onChange={e => setFormMilitar({...formMilitar, senha: e.target.value})} style={styles.input} />
              </div>

              <div style={styles.inputGroupCol}>
                <label style={styles.inputLabel}>Perfil de Acesso no SIGEM</label>
                <select value={formMilitar.perfil} onChange={e => setFormMilitar({...formMilitar, perfil: e.target.value})} style={styles.input}>
                  <option value="usuario">Visão da Tropa (Comum)</option>
                  <option value="escalante">Escalante (Administrador)</option>
                </select>
              </div>
            </div>
            
            <button type="submit" style={styles.btnAcao}>
              <UserPlus size={18}/> Salvar Militar no Banco de Dados
            </button>
          </form>
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
  btnFeriado: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroupCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '12px', fontWeight: 'bold', color: '#004d40', textTransform: 'uppercase' },
  btnAcao: { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', backgroundColor: '#004d40', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content', marginTop: '15px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccd0d5', fontSize: '15px', outline: 'none' },
  msgErro: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', borderLeft: '5px solid #c62828', animation: 'fadeIn 0.3s ease' },
  msgSucesso: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', borderLeft: '5px solid #2e7d32', animation: 'fadeIn 0.3s ease' },
};