package escalas.repository;

import escalas.model.Permuta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermutaRepository extends JpaRepository<Permuta, Long> {
}