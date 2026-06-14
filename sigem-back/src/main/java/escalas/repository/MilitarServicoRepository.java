package escalas.repository;

import escalas.model.MilitarServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// ATENÇÃO AQUI: O ID não é Long, é a nossa chave composta MilitarServicoId
public interface MilitarServicoRepository extends JpaRepository<MilitarServico, MilitarServico.MilitarServicoId> {

    // Método para achar todos os serviços que um militar específico pode tirar
    List<MilitarServico> findByMilitarId(Long militarId);

    // Método para achar todos os militares habilitados para um serviço específico
    List<MilitarServico> findByServicoId(Long servicoId);
}