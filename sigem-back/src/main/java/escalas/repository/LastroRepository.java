package escalas.repository;

import escalas.model.Lastro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LastroRepository extends JpaRepository<Lastro, Long> {
    List<Lastro> findByServicoId(Long servicoId);
    boolean existsByMilitarIdAndServicoId(Long militarId, Long servicoId);
    void deleteByMilitarIdAndServicoId(Long militarId, Long servicoId);
}