package escalas.repository;

import escalas.model.Indisponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IndisponibilidadeRepository extends JpaRepository<Indisponibilidade, Long> {

    // Traz todas as indisponibilidades de um militar específico
    List<Indisponibilidade> findByMilitarId(Long militarId);
}