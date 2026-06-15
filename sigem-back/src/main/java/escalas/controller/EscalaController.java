package escalas.controller;

import escalas.dto.EstatisticaQuadrinhoDTO;
import escalas.model.Escala;
import escalas.model.EscalaItem;
import escalas.repository.EscalaItemRepository;
import escalas.repository.EscalaRepository;
import escalas.service.GeradorEscalaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/escalas")
public class EscalaController {

    @Autowired
    private GeradorEscalaService geradorService;

    @Autowired
    private EscalaRepository escalaRepository;

    @Autowired
    private EscalaItemRepository itemRepository;

    // 1. Criar a "Capa" da escala
    @PostMapping
    public Escala criarCapaEscala(@RequestBody Escala escala) {
        return escalaRepository.save(escala);
    }

    // 2. Gerar a escala automaticamente
    @PostMapping("/{id}/gerar-automatica")
    public Escala gerarAutomatica(@PathVariable Long id) {
        return geradorService.gerarEscalaAutomatica(id);
    }

    // 3. BUSCAR ESCALA
    @GetMapping(value = "/{id}")
    public Escala buscarPorId(@PathVariable("id") Long id) {
        return escalaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escala com o ID " + id + " não foi encontrada no banco."));
    }

    // 4. LISTAR TODAS
    @GetMapping
    public List<Escala> listarTodas() {
        return escalaRepository.findAll();
    }

    // 5. EDITAR ITEM
    @PutMapping("/item/{itemId}")
    public EscalaItem editarItemManual(@PathVariable Long itemId, @RequestBody EscalaItem itemAtualizado) {
        EscalaItem itemExistente = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item da escala não encontrado"));

        itemExistente.setMilitar(itemAtualizado.getMilitar());
        itemExistente.setObservacao(itemAtualizado.getObservacao());

        return itemRepository.save(itemExistente);
    }

    // ROTA 1: Calcula os quadrinhos do ano direto no Back-end
    @GetMapping("/estatisticas")
    public List<EstatisticaQuadrinhoDTO> buscarEstatisticas(
            @RequestParam("ano") int ano,
            @RequestParam("servico") String nomeServico) {

        List<Escala> todasEscalas = escalaRepository.findAll();

        List<Escala> escalasAlvo = todasEscalas.stream()
                .filter(e -> e.getAno() == ano && e.getServico().getNome().equals(nomeServico))
                .collect(Collectors.toList());

        Map<Long, EstatisticaQuadrinhoDTO> contagem = new HashMap<>();

        for (Escala escala : escalasAlvo) {
            for (EscalaItem item : escala.getItens()) {
                if (item.getMilitar() == null) continue;

                Long militarId = item.getMilitar().getId();
                LocalDate dataServico = item.getData();

                boolean isFinalDeSemana = dataServico.getDayOfWeek() == DayOfWeek.SATURDAY ||
                        dataServico.getDayOfWeek() == DayOfWeek.SUNDAY;

                // REGRA DE OURO: É vermelho se for Sábado/Domingo OU se o admin marcou como feriado
                boolean isVermelho = isFinalDeSemana || (item.getIsFeriadoManual() != null && item.getIsFeriadoManual());

                EstatisticaQuadrinhoDTO dto = contagem.getOrDefault(militarId,
                        new EstatisticaQuadrinhoDTO(item.getMilitar().getGraduacao(), item.getMilitar().getNomeGuerra(), 0, 0));

                int novosPretos = dto.getPretos() + (isVermelho ? 0 : 1);
                int novosVermelhos = dto.getVermelhos() + (isVermelho ? 1 : 0);

                contagem.put(militarId, new EstatisticaQuadrinhoDTO(dto.getGraduacao(), dto.getNomeGuerra(), novosPretos, novosVermelhos));
            }
        }

        // Retorna a lista pronta, ordenada alfabeticamente pelo nome de guerra
        return contagem.values().stream()
                .sorted(Comparator.comparing(EstatisticaQuadrinhoDTO::getNomeGuerra, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    // ROTA 2: O botão do Administrador (Liga/Desliga o Feriado)
    @PatchMapping("/itens/{itemId}/alternar-feriado")
    public ResponseEntity<?> alternarFeriadoManual(@PathVariable Long itemId) {
        // CORRIGIDO: Usando o itemRepository que já está injetado na classe
        EscalaItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item da escala não encontrado"));

        boolean valorAtual = item.getIsFeriadoManual() != null ? item.getIsFeriadoManual() : false;
        item.setIsFeriadoManual(!valorAtual);

        itemRepository.save(item);

        return ResponseEntity.ok().body("Status do dia alterado com sucesso para: " + (item.getIsFeriadoManual() ? "Feriado/Vermelho" : "Dia Útil/Preto"));
    }
}