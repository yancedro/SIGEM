package escalas.service;

import escalas.model.Militar;
import escalas.model.MilitarServico;
import escalas.model.Servico;
import escalas.repository.MilitarRepository;
import escalas.repository.MilitarServicoRepository;
import escalas.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MilitarServicoService {

    @Autowired
    private MilitarServicoRepository repository;

    @Autowired
    private MilitarRepository militarRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    // Método para Habilitar um Militar em um Serviço
    public MilitarServico habilitarMilitar(Long militarId, Long servicoId) {

        // 1. Verifica se o Militar existe
        Militar militar = militarRepository.findById(militarId)
                .orElseThrow(() -> new RuntimeException("Militar não encontrado com o ID " + militarId));

        // 2. Verifica se o Serviço existe
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado com o ID " + servicoId));

        // 3. Monta a "Certidão de Casamento"
        MilitarServico.MilitarServicoId idComposto = new MilitarServico.MilitarServicoId(militarId, servicoId);

        MilitarServico habilitacao = new MilitarServico();
        habilitacao.setId(idComposto);
        habilitacao.setMilitar(militar);
        habilitacao.setServico(servico);
        habilitacao.setHabilitado(true);
        habilitacao.setDataHabilitacao(LocalDate.now());

        // 4. Salva no banco
        return repository.save(habilitacao);
    }

    // Listar as habilitações de um militar
    public List<MilitarServico> listarServicosDoMilitar(Long militarId) {
        return repository.findByMilitarId(militarId);
    }
}