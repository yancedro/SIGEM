package escalas.repository;

import escalas.dto.MilitarQuadrinhoDTO;
import escalas.model.Quadrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuadrinhoRepository extends JpaRepository<Quadrinho, Long> {


    @Query("SELECT new escalas.dto.MilitarQuadrinhoDTO(m.id, m.nomeGuerra, m.posto, CAST(SUM(q.quadrinhoValor) AS double)) " +
            "FROM Quadrinho q JOIN q.militar m " +
            "WHERE q.servico.id = :servicoId " +
            "GROUP BY m.id, m.nomeGuerra, m.posto")
    List<MilitarQuadrinhoDTO> resumoPorServico(Long servicoId);

    @Query("SELECT SUM(q.quadrinhoValor) FROM Quadrinho q WHERE q.militar.id = :militarId AND q.servico.id = :servicoId")
    Double somarValoresPorMilitarEServico(Long militarId, Long servicoId);
}