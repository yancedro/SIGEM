package escalas.service;

import escalas.model.Usuario;
import escalas.model.UsuarioPrincipal;
import escalas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Busca o usuário no banco de dados
        Usuario usuario = repository.findByUsername(username);

        // 2. Se o banco não achar ninguém, o objeto vem nulo, então lançamos a exceção
        if (usuario == null) {
            throw new UsernameNotFoundException("Militar com login " + username + " não encontrado no sistema.");
        }

        // 3. Se achou, embrulhamos ele no UsuarioPrincipal para o Spring Security prosseguir
        return new UsuarioPrincipal(usuario);
    }
}