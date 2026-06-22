package escalas.controller;

import escalas.dto.LastroDTO;
import escalas.model.Lastro;
import escalas.model.Militar;
import escalas.model.Servico;
import escalas.repository.LastroRepository;
import escalas.repository.MilitarRepository;
import escalas.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lastros") // Rota EXCLUSIVA para não dar conflito!
public class EscalaConfigController {

    @Autowired
    private LastroRepository lastroRepository;

    @Autowired
    private MilitarRepository militarRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    // --- 1. LISTAR MILITARES VINCULADOS (LASTRO) ---
    @GetMapping("/{servicoId}")
    public List<Militar> buscarEfetivoDaEscala(@PathVariable Long servicoId) {
        List<Lastro> lastros = lastroRepository.findByServicoId(servicoId);
        return lastros.stream().map(Lastro::getMilitar).collect(Collectors.toList());
    }

    // --- 2. VINCULAR MILITAR À ESCALA ---
    @PostMapping
    public ResponseEntity<?> vincularAoLastro(@RequestBody LastroDTO dto) {
        if (lastroRepository.existsByMilitarIdAndServicoId(dto.getMilitarId(), dto.getServicoId())) {
            return ResponseEntity.badRequest().body("Ação negada: Militar já está nesta escala.");
        }

        Militar militar = militarRepository.findById(dto.getMilitarId()).orElse(null);
        Servico servico = servicoRepository.findById(dto.getServicoId()).orElse(null);

        if (militar == null || servico == null) return ResponseEntity.badRequest().build();

        Lastro lastro = new Lastro();
        lastro.setMilitar(militar);
        lastro.setServico(servico);
        lastroRepository.save(lastro);

        return ResponseEntity.ok().build();
    }

    // --- 3. REMOVER MILITAR DA ESCALA ---
    @DeleteMapping
    @Transactional
    public ResponseEntity<?> removerDoLastro(@RequestBody LastroDTO dto) {
        lastroRepository.deleteByMilitarIdAndServicoId(dto.getMilitarId(), dto.getServicoId());
        return ResponseEntity.ok().build();
    }
}