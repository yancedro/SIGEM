package escalas.repository;

import escalas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Criamos esse método personalizado para o sistema de Login que faremos depois
    Optional<Usuario> findByUsername(String username);
}