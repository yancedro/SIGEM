package escalas.service;

import escalas.model.Militar;
import escalas.model.Usuario;
import escalas.repository.MilitarRepository;
import escalas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MilitarService {

    @Autowired
    private MilitarRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- 1. CADASTRO DE TROPA COM CRIAÇÃO DE USUÁRIO ---
    @Transactional // CRÍTICO: Garante que ou salva as DUAS tabelas, ou não salva nenhuma!
    public Militar cadastrar(Militar militar) {

        // 1. Validação de Duplicidade no RH (Militar)
        if (repository.existsBySaram(militar.getSaram())) {
            throw new IllegalArgumentException("Ação negada: Já existe um militar cadastrado com este SARAM.");
        }
        if (repository.existsByCpf(militar.getCpf())) {
            throw new IllegalArgumentException("Ação negada: Já existe um militar cadastrado com este CPF.");
        }

        // 2. Preenchimento automático da data de apresentação
        if (militar.getDataApresentacao() == null) {
            militar.setDataApresentacao(LocalDate.now());
        }

        // 3. Salva a Ficha Física no banco (RH)
        Militar militarSalvo = repository.save(militar);

        // 4. Cria automaticamente a Credencial Digital (Usuario)
        Usuario novoUsuario = new Usuario();
        novoUsuario.setUsername(militarSalvo.getSaram());
        novoUsuario.setEmail(militarSalvo.getEmail());

        // 🔒 CRIPTOGRAFIA REAL: O banco vai salvar um Hash ilegível e super seguro
        novoUsuario.setSenhaHash(passwordEncoder.encode(militarSalvo.getSenha()));

        // Converte a nomenclatura do React para o padrão do seu banco de dados
        String papelBanco = militarSalvo.getPerfil().equalsIgnoreCase("escalante") ? "ESCALANTE" : "USUARIO_COMUM";
        novoUsuario.setPapel(papelBanco);

        // VINCULA O USUÁRIO À FICHA DO MILITAR (A chave de ouro da sua modelagem)
        novoUsuario.setMilitar(militarSalvo);

        // 5. Salva a Credencial
        usuarioRepository.save(novoUsuario);

        // Devolvemos o militar para o React montar a tela de sucesso
        return militarSalvo;
    }

    // --- 2. AUTENTICAÇÃO REAL (BUSCANDO NA TABELA CERTA) ---
    @Transactional // 🔒 CRÍTICO: Mantém a conexão aberta para buscar os dados do militar vinculados
    public Militar autenticar(String saram, String senha, String perfilReact) {

        // 1. Busca na tabela de credenciais
        Usuario usuario = usuarioRepository.findByUsername(saram);

        // 2. Verifica null, se a conta está ativa e se a SENHA CRIPTOGRAFADA BATE
        if (usuario != null && usuario.getAtivo() && passwordEncoder.matches(senha, usuario.getSenhaHash())) {

            // 3. Verifica se o papel exigido pela tela de login é o mesmo que ele tem
            String papelEsperado = perfilReact.equalsIgnoreCase("escalante") ? "ESCALANTE" : "USUARIO_COMUM";

            if (usuario.getPapel().equals(papelEsperado)) {
                // Se tudo estiver certo, devolvemos a Ficha do Militar para o React abrir o Dashboard!
                return usuario.getMilitar();
            }
        }

        // Se errar qualquer coisa, devolve nulo e o Controller lança o Erro 401
        return null;
    }

    // =======================================================
    // MÉTODOS DE CRUD PARA O CONTROLLER FUNCIONAR
    // =======================================================

    public List<Militar> listarTodos() {
        return repository.findAll(); // Corrigido: Agora busca a lista real no banco de dados!
    }

    public Militar buscarPorId(Long id) {
        // Busca o militar ou lança erro se não achar
        return repository.findById(id).orElseThrow(() ->
                new RuntimeException("Militar não encontrado com ID: " + id));
    }

    public Militar buscarPorSaram(String saram) {
        // Requer que o método findBySaram exista no MilitarRepository
        return repository.findBySaram(saram);
    }

    public Militar atualizar(Long id, Militar militarAtualizado) {
        // 1. Busca o militar usando o nome de variável correto: 'repository'
        Militar militarExistente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Militar não encontrado."));

        // 2. Guarda o SARAM antigo caso ele tenha sido alterado
        String saramAntigo = militarExistente.getSaram();

        // 3. Atualiza os dados básicos com o que veio do React
        militarExistente.setNomeCompleto(militarAtualizado.getNomeCompleto());
        militarExistente.setNomeGuerra(militarAtualizado.getNomeGuerra());
        militarExistente.setGraduacao(militarAtualizado.getGraduacao());
        militarExistente.setSaram(militarAtualizado.getSaram());
        militarExistente.setCpf(militarAtualizado.getCpf());
        militarExistente.setEmail(militarAtualizado.getEmail());
        militarExistente.setTelefone(militarAtualizado.getTelefone());
        militarExistente.setPerfil(militarAtualizado.getPerfil());

        // 4. SINCRONIZA A TABELA DE USUÁRIOS (SEGURANÇA)
        Usuario credencial = usuarioRepository.findByUsername(saramAntigo);

        if (credencial != null) {
            credencial.setUsername(militarAtualizado.getSaram());
            String novoPapel = militarAtualizado.getPerfil().equalsIgnoreCase("escalante") ? "ESCALANTE" : "USUARIO_COMUM";
            credencial.setPapel(novoPapel);
            usuarioRepository.save(credencial);
        }

        // 5. Salva os dados usando 'repository'
        return repository.save(militarExistente);
    }

    @Transactional
    public void excluir(Long id) {
        Militar m = buscarPorId(id);
        Usuario u = usuarioRepository.findByUsername(m.getSaram());
        if (u != null) {
            usuarioRepository.delete(u); // Apaga a credencial primeiro
        }
        repository.delete(m); // Depois apaga o militar
    }
}