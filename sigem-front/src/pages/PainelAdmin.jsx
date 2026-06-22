import { useState, useEffect } from 'react';
import { UserPlus, CalendarPlus, CalendarRange, BarChart3, ShieldAlert, Flag, Zap, PlusCircle, CheckCircle, AlertCircle, Search, Edit, XCircle, Save, Users } from 'lucide-react';
import api from '../services/api';

const authConfig = { auth: { username: '123456789', password: '123' } };
const nomeMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function PainelAdmin() {
  const [subAba, setSubAba] = useState('escalar');
  const [listaEscalas, setListaEscalas] = useState([]);
  const [mesFiltro, setMesFiltro] = useState('');
  const [escalaIdSelecionada, setEscalaIdSelecionada] = useState('');
  const [dadosEscala, setDadosEscala] = useState(null);

  // ESTADOS: CRIAR ESCALA
  const [nomeNovoServico, setNomeNovoServico] = useState('');
  const [listaMilitares, setListaMilitares] = useState([]);
  const [listaServicos, setListaServicos] = useState([]);
  const [formLastro, setFormLastro] = useState({ militarId: '', servicoId: '' });
  const [militaresVinculados, setMilitaresVinculados] = useState([]);

  // ESTADOS: CONSULTAR E EDITAR EFETIVO (NOVO)
  const [termoBusca, setTermoBusca] = useState('');
  const [militarEditando, setMilitarEditando] = useState(null);

  // Estado do formulário para CADASTRO
  const [formMilitar, setFormMilitar] = useState({ 
    nomeCompleto: '', nomeGuerra: '', graduacao: 'S2', saram: '', 
    cpf: '', email: '', telefone: '', dataNascimento: '', senha: '', perfil: 'usuario'
  });

  // MÁSCARAS
  const aplicarMascaraCPF = (valor) => valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1'); 
  const aplicarMascaraSaram = (valor) => valor.replace(/\D/g, '').slice(0, 7); 
  const aplicarMascaraTelefone = (valor) => {
  // 1. Remove qualquer caractere que não seja número
  const apenasNumeros = valor.replace(/\D/g, '');
  
  // 2. Aplica a formatação
  return apenasNumeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
    .slice(0, 15); // Limita o tamanho total da string formatada
};
 
  // MENSAGEM GLOBAL
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 5000);
  };

  // ==========================================
  // CARREGAMENTOS (useEffect)
  // ==========================================
  const carregarDadosGerais = async () => {
    try {
      const resMilitares = await api.get('/militares', authConfig).catch(() => ({data: []}));
      setListaMilitares(resMilitares.data);

      const resServicos = await api.get('/servicos', authConfig).catch(() => ({data: []})); 
      setListaServicos(resServicos.data);
    } catch (error) { console.log("Aguardando rotas do backend..."); }
  };

  useEffect(() => {
    carregarDadosGerais(); 
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

  const carregarMilitaresVinculados = async (servicoId) => {
    if (!servicoId) { setMilitaresVinculados([]); return; }
    try {
      const res = await api.get(`/lastros/${servicoId}`, authConfig);
      setMilitaresVinculados(res.data);
    } catch (err) { console.log("Erro ao carregar efetivo."); }
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const handleCadastrarMilitar = async (e) => {
    e.preventDefault();
    if (formMilitar.saram.length !== 7 || formMilitar.cpf.length !== 14) {
      mostrarMensagem("Ação negada: Verifique se SARAM possui 7 dígitos e o CPF está completo.", "erro");
      return;
    }
    try {
      await api.post('/militares', formMilitar, authConfig);
      mostrarMensagem(`Militar cadastrado com sucesso!`, "sucesso");
      setFormMilitar({ nomeCompleto: '', nomeGuerra: '', graduacao: 'S2', saram: '', cpf: '', email: '', telefone: '', dataNascimento: '', senha: '', perfil: 'usuario' });
      carregarDadosGerais(); 
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : "Erro interno no servidor.";
      mostrarMensagem(msg, "erro");
    }
  };

  // 🚨 NOVA FUNÇÃO: Atualizar Militar
  const handleAtualizarMilitar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/militares/${militarEditando.id}`, militarEditando, authConfig);
      mostrarMensagem(`Dados do militar atualizados com sucesso!`, "sucesso");
      setMilitarEditando(null); // Fecha a tela de edição
      carregarDadosGerais(); // Recarrega a lista com os novos dados
    } catch (err) {
      mostrarMensagem("Erro ao atualizar militar no servidor.", "erro");
    }
  };

  const handleAlternarFeriado = async (itemId) => {
    try { await api.patch(`/escalas/itens/${itemId}/alternar-feriado`, {}, authConfig); carregarItensEscala(); } 
    catch (err) { alert("Erro ao alternar feriado."); }
  };

  const handleGerarAutomatica = async () => {
    if (!escalaIdSelecionada) return;
    try { await api.post(`/${escalaIdSelecionada}/gerar-automatica`, {}, authConfig); alert("Escala gerada com sucesso!"); carregarItensEscala(); } 
    catch (err) { alert("Falha na geração automática."); }
  };

  const handleCriarNovoServico = async (e) => {
    e.preventDefault();
    if (!nomeNovoServico.trim()) return;
    try {
      await api.post('/servicos', { nome: nomeNovoServico }, authConfig);
      mostrarMensagem(`Escala cadastrada com sucesso!`, "sucesso");
      setNomeNovoServico(''); carregarDadosGerais(); 
    } catch (err) { mostrarMensagem("Erro ao criar escala.", "erro"); }
  };

  const handleAdicionarAoLastro = async (e) => {
    e.preventDefault();
    if (!formLastro.militarId || !formLastro.servicoId) return;
    try {
      await api.post('/lastros', formLastro, authConfig);
      mostrarMensagem("Militar vinculado com sucesso!", "sucesso");
      carregarMilitaresVinculados(formLastro.servicoId); setFormLastro({ ...formLastro, militarId: '' }); 
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : "Erro ao vincular militar.";
      mostrarMensagem(msg, "erro");
    }
  };

  const handleRemoverDoLastro = async (militarId) => {
    try {
      await api.delete('/lastros', { ...authConfig, data: { militarId: militarId, servicoId: formLastro.servicoId } });
      mostrarMensagem("Militar removido da escala com sucesso!", "sucesso");
      carregarMilitaresVinculados(formLastro.servicoId); 
    } catch (err) { mostrarMensagem("Erro ao remover militar.", "erro"); }
  };

  const escalasFiltradas = listaEscalas.filter(e => e.mes.toString() === mesFiltro);
  
  // 🚨 LÓGICA DO FILTRO INTELIGENTE
  const militaresFiltrados = listaMilitares.filter(m => {
    const termo = termoBusca.toLowerCase();
    return (
      m.nomeCompleto?.toLowerCase().includes(termo) ||
      m.nomeGuerra?.toLowerCase().includes(termo) ||
      m.cpf?.includes(termo) ||
      m.saram?.includes(termo)
    );
  });

  return (
    <div style={styles.container}>
      {mensagem.texto && (
        <div style={mensagem.tipo === 'erro' ? styles.msgErro : styles.msgSucesso}>
          {mensagem.tipo === 'erro' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {/* MENU SUPERIOR COM A NOVA ABA */}
      <div style={styles.topMenu}>
        <button onClick={() => setSubAba('cadastro')} style={{...styles.tabBtn, borderBottomColor: subAba === 'cadastro' ? '#004d40' : 'transparent'}}>
          <UserPlus size={18} /> Cadastrar Tropa
        </button>
        <button onClick={() => { setSubAba('consultar'); setMilitarEditando(null); }} style={{...styles.tabBtn, borderBottomColor: subAba === 'consultar' ? '#004d40' : 'transparent'}}>
          <Users size={18} /> Consultar Efetivo
        </button>
        <button onClick={() => setSubAba('criar-escala')} style={{...styles.tabBtn, borderBottomColor: subAba === 'criar-escala' ? '#004d40' : 'transparent'}}>
          <PlusCircle size={18} /> Criar Escala
        </button>
        <button onClick={() => setSubAba('criar-capa')} style={{...styles.tabBtn, borderBottomColor: subAba === 'criar-capa' ? '#004d40' : 'transparent'}}>
          <CalendarPlus size={18} /> Abertura de Mês
        </button>
        <button onClick={() => setSubAba('escalar')} style={{...styles.tabBtn, borderBottomColor: subAba === 'escalar' ? '#004d40' : 'transparent'}}>
          <CalendarRange size={18} /> Alocação Operacional
        </button>
      </div>

      <div style={styles.innerContent}>
        
        {/* ABA 1: CONSULTAR E EDITAR EFETIVO (NOVA) */}
        {subAba === 'consultar' && (
          <div style={styles.formCard}>
            
            {/* TELA A: LISTAGEM E BUSCA */}
            {!militarEditando ? (
              <>
                <h3 style={{ color: '#004d40', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>
                  Gerenciamento do Efetivo ({listaMilitares.length} Cadastrados)
                </h3>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                  <Search size={20} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Buscar por Nome, Nome de Guerra, CPF ou SARAM..." 
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
                  />
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#e0f2f1', zIndex: 1 }}>
                      <tr>
                        <th style={styles.th}>SARAM</th>
                        <th style={styles.th}>Posto / Grad</th>
                        <th style={styles.th}>Nome de Guerra</th>
                        <th style={styles.th}>Nome Completo</th>
                        <th style={styles.th}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {militaresFiltrados.map(m => (
                        <tr key={m.id} style={styles.tr}>
                          <td style={{...styles.td, fontWeight: 'bold'}}>{m.saram}</td>
                          <td style={styles.td}>{m.graduacao}</td>
                          <td style={styles.td}>{m.nomeGuerra}</td>
                          <td style={styles.td}>{m.nomeCompleto}</td>
                          <td style={styles.td}>
                            <button onClick={() => setMilitarEditando(m)} style={{ padding: '6px 12px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                              <Edit size={14} /> Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {militaresFiltrados.length === 0 && (
                        <tr><td colSpan="5" style={styles.tdVazio}>Nenhum militar encontrado com esse termo.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (

            // TELA B: FORMULÁRIO DE EDIÇÃO
              <form onSubmit={handleAtualizarMilitar}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>
                  <h3 style={{ color: '#004d40', margin: 0 }}>
                    Editando Militar: {militarEditando.graduacao} {militarEditando.nomeGuerra}
                  </h3>
                  <button type="button" onClick={() => setMilitarEditando(null)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <XCircle size={18} /> Cancelar Edição
                  </button>
                </div>
                
                <div style={styles.formGrid}>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>Nome Completo</label>
                    <input type="text" required value={militarEditando.nomeCompleto} onChange={e => setMilitarEditando({...militarEditando, nomeCompleto: e.target.value})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>Nome de Guerra</label>
                    <input type="text" required value={militarEditando.nomeGuerra} onChange={e => setMilitarEditando({...militarEditando, nomeGuerra: e.target.value})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>Posto / Graduação</label>
                    <select value={militarEditando.graduacao} onChange={e => setMilitarEditando({...militarEditando, graduacao: e.target.value})} style={styles.input}>
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
                    <input type="text" required value={militarEditando.saram} onChange={e => setMilitarEditando({...militarEditando, saram: aplicarMascaraSaram(e.target.value)})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>CPF</label>
                    <input type="text" required value={militarEditando.cpf} onChange={e => setMilitarEditando({...militarEditando, cpf: aplicarMascaraCPF(e.target.value)})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>E-mail</label>
                    <input type="email" required value={militarEditando.email} onChange={e => setMilitarEditando({...militarEditando, email: e.target.value})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>Telefone</label>
                    <input type="tel" required value={militarEditando.telefone} onChange={e => setMilitarEditando({...militarEditando, telefone: e.target.value})} style={styles.input} />
                  </div>
                  <div style={styles.inputGroupCol}>
                    <label style={styles.inputLabel}>Perfil de Acesso no SIGEM</label>
                    <select value={militarEditando.perfil} onChange={e => setMilitarEditando({...militarEditando, perfil: e.target.value})} style={styles.input}>
                      <option value="usuario">Visão da Tropa (Comum)</option>
                      <option value="escalante">Escalante (Administrador)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" style={{...styles.btnAcao, backgroundColor: '#1565c0', marginTop: '20px'}}>
                  <Save size={18}/> Salvar Alterações
                </button>
              </form>
            )}
          </div>
        )}

        {/* ABA 2: CADASTRO DE TROPA */}
        {subAba === 'cadastro' && (
          <form onSubmit={handleCadastrarMilitar} style={styles.formCard}>
            <h3 style={{ color: '#004d40', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>Inclusão de Novo Militar no Efetivo</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Nome Completo</label><input type="text" required value={formMilitar.nomeCompleto} onChange={e => setFormMilitar({...formMilitar, nomeCompleto: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Nome de Guerra</label><input type="text" required value={formMilitar.nomeGuerra} onChange={e => setFormMilitar({...formMilitar, nomeGuerra: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Posto / Graduação</label><select value={formMilitar.graduacao} onChange={e => setFormMilitar({...formMilitar, graduacao: e.target.value})} style={styles.input}><option value="S2">S2</option><option value="S1">S1</option><option value="CB">CB</option><option value="3S">3S</option><option value="2S">2S</option><option value="1S">1S</option><option value="SO">SO</option><option value="2T">2T</option><option value="1T">1T</option><option value="CAP">CAP</option><option value="MAJ">MAJ</option><option value="TC">TC</option></select></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>SARAM (Login)</label><input type="text" required placeholder="Ex: 1234567" value={formMilitar.saram} onChange={e => setFormMilitar({...formMilitar, saram: aplicarMascaraSaram(e.target.value)})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>CPF</label><input type="text" required placeholder="000.000.000-00" value={formMilitar.cpf} onChange={e => setFormMilitar({...formMilitar, cpf: aplicarMascaraCPF(e.target.value)})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>E-mail</label><input type="email" required placeholder="nome@unidade.mil" value={formMilitar.email} onChange={e => setFormMilitar({...formMilitar, email: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Telefone</label><input type="tel" required placeholder="(XX) 9XXXX-XXXX" value={formMilitar.telefone} onChange={e => setFormMilitar({...formMilitar, telefone: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Data de Nascimento</label><input type="date" required value={formMilitar.dataNascimento} onChange={e => setFormMilitar({...formMilitar, dataNascimento: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Senha de Acesso</label><input type="password" required value={formMilitar.senha} onChange={e => setFormMilitar({...formMilitar, senha: e.target.value})} style={styles.input} /></div>
              <div style={styles.inputGroupCol}><label style={styles.inputLabel}>Perfil</label><select value={formMilitar.perfil} onChange={e => setFormMilitar({...formMilitar, perfil: e.target.value})} style={styles.input}><option value="usuario">Visão da Tropa</option><option value="escalante">Escalante</option></select></div>
            </div>
            <button type="submit" style={styles.btnAcao}><UserPlus size={18}/> Salvar Militar no Banco</button>
          </form>
        )}

        {/* ABA 3: CRIAR ESCALA */}
        {subAba === 'criar-escala' && (
          <div style={styles.formCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ borderRight: '1px solid #e0f2f1', paddingRight: '40px' }}>
                <h3 style={{ color: '#004d40', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>1. Cadastrar Nova Escala</h3>
                <form onSubmit={handleCriarNovoServico} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={styles.inputGroupCol}><label style={styles.inputLabel}>NOME DA ESCALA</label><input type="text" value={nomeNovoServico} onChange={(e) => setNomeNovoServico(e.target.value)} style={styles.input} required /></div>
                  <button type="submit" style={{ ...styles.btnAcao, width: '100%' }}><CalendarPlus size={18}/> Cadastrar Escala</button>
                </form>
              </div>
              <div>
                <h3 style={{ color: '#004d40', marginBottom: '20px', borderBottom: '2px solid #e0f2f1', paddingBottom: '10px' }}>2. Gerenciar Efetivo</h3>
                <form onSubmit={handleAdicionarAoLastro} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                  <div style={styles.inputGroupCol}><label style={styles.inputLabel}>SELECIONE A ESCALA</label><select style={styles.input} value={formLastro.servicoId} onChange={(e) => { setFormLastro({...formLastro, servicoId: e.target.value}); carregarMilitaresVinculados(e.target.value); }} required><option value="">-- Escala --</option>{listaServicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></div>
                  <div style={styles.inputGroupCol}><label style={styles.inputLabel}>SELECIONE O MILITAR</label><select style={styles.input} value={formLastro.militarId} onChange={(e) => setFormLastro({...formLastro, militarId: e.target.value})} required><option value="">-- Militar --</option>{listaMilitares.map(m => <option key={m.id} value={m.id}>{m.graduacao} {m.nomeGuerra} ({m.saram})</option>)}</select></div>
                  <button type="submit" style={{ ...styles.btnAcao, width: '100%', backgroundColor: '#003366' }} disabled={!formLastro.servicoId}><UserPlus size={18}/> Vincular à Escala</button>
                </form>
                <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                  <label style={{ ...styles.inputLabel, marginBottom: '10px', display: 'block' }}>Militares Concorrentes:</label>
                  {formLastro.servicoId ? (militaresVinculados.length > 0 ? (<div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '6px' }}>{militaresVinculados.map(m => (<div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>{m.graduacao} {m.nomeGuerra}</span><button type="button" onClick={() => handleRemoverDoLastro(m.id)} style={{ padding: '4px 10px', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remover</button></div>))}</div>) : (<p style={{ fontSize: '13px', color: '#777' }}>Nenhum militar no lastro.</p>)) : (<p style={{ fontSize: '13px', color: '#999' }}>Selecione uma escala acima.</p>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OUTRAS ABAS */}
        {subAba === 'criar-capa' && (<div style={styles.formCard}><h3>Módulo em Desenvolvimento</h3><p>Estrutura mensal vazia entrará aqui.</p></div>)}
        {subAba === 'escalar' && (
          <div>
            <div style={styles.filterInline}>
              <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} style={styles.select}>{[...new Set(listaEscalas.map(e => e.mes))].map(m => <option key={m} value={m}>{nomeMeses[m]}</option>)}</select>
              <select value={escalaIdSelecionada} onChange={(e) => setEscalaIdSelecionada(e.target.value)} style={styles.select}>{escalasFiltradas.map(esc => <option key={esc.id} value={esc.id}>{esc.servico?.nome}</option>)}</select>
              <button onClick={handleGerarAutomatica} style={styles.btnZap} disabled={!escalaIdSelecionada}><Zap size={16}/> Gerar Escala Automática</button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead><tr style={styles.thRow}><th style={styles.th}>Data</th><th style={styles.th}>Militar Alocado</th><th style={styles.th}>Controle de Feriado</th></tr></thead>
                <tbody>{dadosEscala?.itens?.length > 0 ? ([...dadosEscala.itens].sort((a,b) => new Date(a.data) - new Date(b.data)).map((item, idx) => { const isFeriado = item.isFeriadoManual === true; return (<tr key={idx} style={styles.tr}><td style={{...styles.td, fontWeight: 'bold'}}>{item.data.split('-').reverse().join('/')}</td><td style={styles.td}>{item.militar ? `${item.militar.graduacao} ${item.militar.nomeGuerra}` : 'Vago'}</td><td style={styles.td}><button onClick={() => handleAlternarFeriado(item.id)} style={{...styles.btnFeriado, backgroundColor: isFeriado ? '#ffebee' : '#f5f5f5', color: isFeriado ? '#d32f2f' : '#616161', border: isFeriado ? '1px solid #ef9a9a' : '1px solid #e0e0e0'}}><Flag size={14} fill={isFeriado ? '#d32f2f' : 'none'}/> {isFeriado ? 'Desmarcar Feriado' : 'Tornar Vermelha'}</button></td></tr>) })) : (<tr><td colSpan="3" style={styles.tdVazio}>Selecione uma escala.</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', border: '2px solid #004d40' },
  topMenu: { display: 'flex', gap: '15px', borderBottom: '2px solid #e9ecef', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '3px solid transparent', fontSize: '15px', fontWeight: '600', color: '#555', cursor: 'pointer', whiteSpace: 'nowrap' },
  innerContent: { minHeight: '350px' },
  formCard: { background: '#fafafa', padding: '25px', borderRadius: '8px', border: '1px solid #eef0f2' },
  filterInline: { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' },
  select: { padding: '10px', borderRadius: '6px', border: '1px solid #dee2e6', minWidth: '180px' },
  btnZap: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e0f2f1', color: '#004d40', border: '1px solid #80cbc4', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  tableContainer: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { backgroundColor: '#e0f2f1' },
  th: { padding: '14px', color: '#004d40', fontSize: '13px', textTransform: 'uppercase', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff' },
  td: { padding: '14px', color: '#334155', fontSize: '15px' },
  tdVazio: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  btnFeriado: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroupCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '12px', fontWeight: 'bold', color: '#004d40', textTransform: 'uppercase' },
  btnAcao: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white', backgroundColor: '#004d40', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content', marginTop: '15px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccd0d5', fontSize: '15px', outline: 'none' },
  msgErro: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', borderLeft: '5px solid #c62828' },
  msgSucesso: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', borderLeft: '5px solid #2e7d32' },
};