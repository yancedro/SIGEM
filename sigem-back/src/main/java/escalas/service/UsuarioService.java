package escalas.service;

import escalas.model.Usuario;
import escalas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Método para o militar trocar a própria senha
    public void alterarSenha(Long usuarioId, String novaSenha) {
        Usuario usuario = repository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        repository.save(usuario);
    }

    // Método para o Escalante promover um ajudante
    public void promoverAEscalante(Long usuarioId) {
        Usuario usuario = repository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setPapel("ESCALANTE");
        repository.save(usuario);
    }

    // Cadastro inicial (CPF e senha solicitada)
    public Usuario cadastrarNovo(Usuario usuario) {
        usuario.setSenhaHash(passwordEncoder.encode(usuario.getSenhaHash()));
        if (usuario.getPapel() == null) {
            usuario.setPapel("USUARIO_COMUM");
        }
        return repository.save(usuario);
    }
}