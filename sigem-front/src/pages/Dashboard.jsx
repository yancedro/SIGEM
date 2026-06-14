import { useState, useEffect } from 'react';
import { LogOut, Calendar, LayoutDashboard, AlertTriangle, Hash, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const authConfig = {
    auth: { username: '123456789', password: '123' }
};

const nomeMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function Dashboard() {
    const [abaAtiva, setAbaAtiva] = useState('escalas');
    const [listaEscalas, setListaEscalas] = useState([]);
    const [erro, setErro] = useState('');

    // ==========================================
    // ESTADOS DA ABA 1: ESCALAS MENSAIS
    // ==========================================
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [escalaIdSelecionada, setEscalaIdSelecionada] = useState('');
    const [dadosEscalaMensal, setDadosEscalaMensal] = useState(null);

    // ==========================================
    // ESTADOS DA ABA 2: QUADRINHOS (Fatores)
    // ==========================================
    const [anoQuadrinho, setAnoQuadrinho] = useState('');
    const [servicoQuadrinho, setServicoQuadrinho] = useState('');
    const [dadosQuadrinhos, setDadosQuadrinhos] = useState([]); // Armazena a contagem real do banco
    const [carregandoQuadrinhos, setCarregandoQuadrinhos] = useState(false);

    // 1. Busca inicial das escalas do banco (Capa)
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
                console.error("Erro na API:", err);
                setErro('Falha ao conectar com o servidor.');
            }
        };
        carregarTudo();
    }, []);

    // ABA 1: Quando o usuário muda o mês, atualiza as opções de escalas daquele mês
    useEffect(() => {
        if (mesSelecionado && listaEscalas.length > 0) {
            const escalasDoMes = listaEscalas.filter(e => e.mes.toString() === mesSelecionado);
            if (escalasDoMes.length > 0) {
                setEscalaIdSelecionada(escalasDoMes[0].id.toString());
            } else {
                setEscalaIdSelecionada('');
                setDadosEscalaMensal(null);
            }
        }
    }, [mesSelecionado, listaEscalas]);

    // ABA 1: Busca a lista de militares dia a dia da escala selecionada
    useEffect(() => {
        const carregarEscala = async () => {
            if (!escalaIdSelecionada) return;
            try {
                const response = await api.get(`/escalas/${escalaIdSelecionada}?_cb=${new Date().getTime()}`, authConfig);
                setDadosEscalaMensal(response.data);
            } catch (err) {
                console.error("Erro:", err);
            }
        };
        if (abaAtiva === 'escalas') carregarEscala();
    }, [escalaIdSelecionada, abaAtiva]);

    // =========================================================================
    // ABA 2: O CÉREBRO DOS QUADRINHOS (Busca no banco e calcula Preto/Vermelho)
    // =========================================================================
    useEffect(() => {
        const calcularFatores = async () => {
            if (!anoQuadrinho || !servicoQuadrinho) {
                setDadosQuadrinhos([]);
                return;
            }

            setCarregandoQuadrinhos(true);

            // Pega todas as escalas daquele ano e daquele serviço específico
            const escalasAlvo = listaEscalas.filter(
                e => e.ano.toString() === anoQuadrinho && e.servico?.nome === servicoQuadrinho
            );

            if (escalasAlvo.length === 0) {
                setDadosQuadrinhos([]);
                setCarregandoQuadrinhos(false);
                return;
            }

            try {
                // Dispara requisições para buscar os detalhes de todos os meses desse serviço
                const promessas = escalasAlvo.map(e => api.get(`/escalas/${e.id}?_cb=${new Date().getTime()}`, authConfig));
                const respostas = await Promise.all(promessas);

                const agregacao = {};

                // Varre todos os meses e todos os militares
                respostas.forEach(res => {
                    if (res.data && res.data.itens) {
                        res.data.itens.forEach(item => {
                            if (!item.militar) return;

                            const militarId = item.militar.id;

                            // Se o militar ainda não está na lista, adiciona ele com zero quadrinhos
                            if (!agregacao[militarId]) {
                                agregacao[militarId] = {
                                    militar: item.militar,
                                    pretos: 0,
                                    vermelhos: 0
                                };
                            }

                            // Extrai a data do banco e verifica o dia da semana
                            // Adicionamos "T12:00:00" para evitar bugs de fuso horário brasileiro no navegador
                            const dataServico = new Date(item.data + "T12:00:00");
                            const diaSemana = dataServico.getDay();

                            // 0 = Domingo, 6 = Sábado
                            if (diaSemana === 0 || diaSemana === 6) {
                                agregacao[militarId].vermelhos += 1;
                            } else {
                                agregacao[militarId].pretos += 1;
                            }
                        });
                    }
                });

                // Transforma o objeto em uma lista (array) para o React conseguir desenhar a tabela
                const listaFinal = Object.values(agregacao).sort((a, b) =>
                    a.militar.nomeGuerra.localeCompare(b.militar.nomeGuerra)
                );

                setDadosQuadrinhos(listaFinal);
            } catch (err) {
                console.error("Erro ao calcular quadrinhos:", err);
            } finally {
                setCarregandoQuadrinhos(false);
            }
        };

        if (abaAtiva === 'quadrinhos') calcularFatores();
    }, [anoQuadrinho, servicoQuadrinho, abaAtiva, listaEscalas]);


    // Extrai nome único dos serviços para o select (sem repetir nomes)
    const servicosUnicos = Array.from(new Set(listaEscalas.map(e => e.servico?.nome))).filter(Boolean);
    const mesesDisponiveis = [...new Set(listaEscalas.map(e => e.mes))].sort((a, b) => a - b);
    const escalasDoMesFiltro = listaEscalas.filter(e => e.mes.toString() === mesSelecionado);
    const anosDisponiveis = [...new Set(listaEscalas.map(e => e.ano))].sort((a, b) => b - a);

    return (
        <div style={styles.container}>
            {/* MENU LATERAL */}
            <nav style={styles.sidebar}>
                <div style={styles.logoContainer}>
                    <ShieldCheck size={40} color="#64b5f6" />
                    <h2 style={styles.logo}>SIGEM</h2>
                </div>

                <div style={styles.menu}>
                    <div onClick={() => setAbaAtiva('dashboard')} style={{ ...styles.menuItem, backgroundColor: abaAtiva === 'dashboard' ? '#1a4d80' : 'transparent' }}>
                        <LayoutDashboard size={20} /> Painel Inicial
                    </div>
                    <div onClick={() => setAbaAtiva('escalas')} style={{ ...styles.menuItem, backgroundColor: abaAtiva === 'escalas' ? '#1a4d80' : 'transparent' }}>
                        <Calendar size={20} /> Escalas Mensais
                    </div>
                    <div onClick={() => setAbaAtiva('quadrinhos')} style={{ ...styles.menuItem, backgroundColor: abaAtiva === 'quadrinhos' ? '#1a4d80' : 'transparent' }}>
                        <Hash size={20} /> Fatores / Quadrinhos
                    </div>
                </div>
                <button onClick={() => window.location.href = '/'} style={styles.logoutBtn}>
                    <LogOut size={20} /> Sair
                </button>
            </nav>

            {/* ÁREA CENTRAL */}
            <main style={styles.content}>

                {/* TELA 1: ESCALAS MENSAIS */}
                {abaAtiva === 'escalas' && (
                    <div>
                        <h1 style={styles.tituloSecao}>Consulta de Escalas Mensais</h1>

                        <div style={styles.filterCard}>
                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Filtro de Mês:</label>
                                <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} style={styles.select}>
                                    {mesesDisponiveis.map(mes => (
                                        <option key={mes} value={mes}>{nomeMeses[mes]} (Mês {mes})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Filtro de Escala:</label>
                                <select value={escalaIdSelecionada} onChange={(e) => setEscalaIdSelecionada(e.target.value)} style={styles.select} disabled={!mesSelecionado}>
                                    {escalasDoMesFiltro.length > 0 ? (
                                        escalasDoMesFiltro.map((esc) => (
                                            <option key={esc.id} value={esc.id}>{esc.servico?.nome} ({esc.tipo})</option>
                                        ))
                                    ) : (
                                        <option value="">Nenhuma escala cadastrada</option>
                                    )}
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
                                        <th style={styles.th}>Situação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosEscalaMensal && dadosEscalaMensal.itens && dadosEscalaMensal.itens.length > 0 ? (
                                        [...dadosEscalaMensal.itens]
                                            .sort((a, b) => new Date(a.data) - new Date(b.data))
                                            .map((item, index) => (
                                                <tr key={index} style={styles.tr}>
                                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                                        {item.data.split('-').reverse().join('/')}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {item.militar ? `${item.militar.graduacao} ${item.militar.nomeGuerra}` : 'Militar'}
                                                    </td>
                                                    <td style={styles.td}>{dadosEscalaMensal.servico?.nome}</td>
                                                    <td style={styles.td}>
                                                        <span style={styles.badge}>{dadosEscalaMensal.tipo}</span>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr style={styles.tr}>
                                            <td colSpan="4" style={styles.tdVazio}>Nenhum registro para este mês.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TELA 2: FATORES / QUADRINHOS */}
                {abaAtiva === 'quadrinhos' && (
                    <div>
                        <h1 style={styles.tituloSecao}>Painel Anual de Fatores e Quadrinhos</h1>

                        <div style={styles.filterCard}>
                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Ano de Referência:</label>
                                <select value={anoQuadrinho} onChange={(e) => setAnoQuadrinho(e.target.value)} style={styles.select}>
                                    {anosDisponiveis.length > 0 ? anosDisponiveis.map(ano => (
                                        <option key={ano} value={ano}>{ano}</option>
                                    )) : <option value="2026">2026</option>}
                                </select>
                            </div>

                            <div style={styles.filterGroup}>
                                <label style={styles.label}>Selecione o Serviço:</label>
                                <select value={servicoQuadrinho} onChange={(e) => setServicoQuadrinho(e.target.value)} style={styles.select}>
                                    <option value="">Selecione o Serviço...</option>
                                    {servicosUnicos.map((servico, index) => (
                                        <option key={index} value={servico}>{servico}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thRow}>
                                        <th style={styles.th}>Militar</th>
                                        <th style={styles.th}>Escala</th>
                                        <th style={{ ...styles.th, textAlign: 'center' }}>Quadrinhos Pretos (Seg a Sex)</th>
                                        <th style={{ ...styles.th, textAlign: 'center' }}>Quadrinhos Vermelhos (Sáb/Dom/Fer)</th>
                                        <th style={{ ...styles.th, textAlign: 'center' }}>Fator Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carregandoQuadrinhos ? (
                                        <tr style={styles.tr}>
                                            <td colSpan="5" style={styles.tdVazio}>Calculando dados do banco de dados...</td>
                                        </tr>
                                    ) : dadosQuadrinhos.length > 0 ? (
                                        dadosQuadrinhos.map((dado, index) => (
                                            <tr key={index} style={styles.tr}>
                                                <td style={styles.td}>{dado.militar.graduacao} {dado.militar.nomeGuerra}</td>
                                                <td style={styles.td}>{servicoQuadrinho}</td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#424242' }}>{dado.pretos}</td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#d32f2f' }}>{dado.vermelhos}</td>
                                                <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                                    {dado.pretos + dado.vermelhos}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr style={styles.tr}>
                                            <td colSpan="5" style={styles.tdVazio}>
                                                {servicoQuadrinho ? 'Nenhum serviço registrado neste ano.' : 'Selecione um Serviço acima para carregar a contagem real.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f4f6f8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    sidebar: { width: '260px', backgroundColor: '#002244', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' },
    logoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' },
    logo: { margin: 0, letterSpacing: '2px', fontSize: '24px' },
    menu: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.3s ease', color: '#e0e0e0', fontWeight: '500' },
    logoutBtn: { backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontWeight: 'bold', marginTop: 'auto', transition: '0.3s' },
    content: { flex: 1, padding: '40px', overflowY: 'auto' },
    tituloSecao: { color: '#003366', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' },
    filterCard: { display: 'flex', gap: '20px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', marginBottom: '25px', flexWrap: 'wrap' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '250px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
    select: { padding: '12px', borderRadius: '6px', border: '1px solid #ccd0d5', fontSize: '15px', outline: 'none', backgroundColor: '#f9fafa', color: '#333', cursor: 'pointer' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' },
    th: { padding: '16px', color: '#495057', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s' },
    td: { padding: '16px', color: '#333', fontSize: '15px' },
    tdVazio: { textAlign: 'center', color: '#777', padding: '40px', fontSize: '15px' },
    badge: { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #bbdefb' },
    errorBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }
};

export default Dashboard;