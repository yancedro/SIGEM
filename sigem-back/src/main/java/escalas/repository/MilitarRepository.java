package escalas.repository;

import escalas.model.Militar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MilitarRepository extends JpaRepository<Militar, Long> {
    // O Spring já nos dá salvar, deletar, buscarPorId, listarTodos de graça!

    // LINHA NOVA: O Spring vai criar um "SELECT * FROM militar WHERE saram = ?"
    boolean existsBySaram(String saram);
    boolean existsByCpf(String cpf);
    Optional<Militar> findBySaram(String saram);
}