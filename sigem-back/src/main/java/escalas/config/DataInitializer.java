package escalas.config;

import escalas.model.Usuario;
import escalas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verifica se já existe algum usuário para não duplicar
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setUsername("123456789"); // Seu CPF
            admin.setEmail("admin@fab.mil.br");
            admin.setSenhaHash(passwordEncoder.encode("123")); // O Java criptografa pra você
            admin.setPapel("ESCALANTE");
            admin.setAtivo(true);

            usuarioRepository.save(admin);
            System.out.println(">>> Usuário Mestre criado com sucesso! Login: 123456789 | Senha: 123");
        }
    }
}