package escalas.repository;

import escalas.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {

    // Novo método: Busca o serviço pelo código único (Ex: "SENTINELA", "OD", "OPO")
    Optional<Servico> findByCodigo(String codigo);
}