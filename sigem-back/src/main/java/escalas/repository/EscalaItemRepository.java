package escalas.repository;

import escalas.model.EscalaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaItemRepository extends JpaRepository<EscalaItem, Long> {
    // Conta quantos serviços o militar tirou para um serviço específico
    @Query("SELECT COUNT(ei) FROM EscalaItem ei WHERE ei.militar.id = :militarId AND ei.escala.servico.id = :servicoId")
    long countByMilitarIdAndServicoId(Long militarId, Long servicoId);
}