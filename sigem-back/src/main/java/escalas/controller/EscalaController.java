package escalas.controller;

import escalas.model.Escala;
import escalas.model.EscalaItem;
import escalas.repository.EscalaItemRepository;
import escalas.repository.EscalaRepository;
import escalas.service.GeradorEscalaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escalas")
public class EscalaController {

    @Autowired
    private GeradorEscalaService geradorService;

    @Autowired
    private EscalaRepository escalaRepository;

    @Autowired
    private EscalaItemRepository itemRepository;

    // 1. Criar a "Capa" da escala (O que você já tinha)
    @PostMapping
    public Escala criarCapaEscala(@RequestBody Escala escala) {
        return escalaRepository.save(escala);
    }

    // 2. Gerar a escala automaticamente (O "Cérebro" que validamos)
    @PostMapping("/{id}/gerar-automatica")
    public Escala gerarAutomatica(@PathVariable Long id) {
        return geradorService.gerarEscalaAutomatica(id);
    }

    // 3. BUSCAR ESCALA: Forçando o mapeamento exato da URL
    @GetMapping(value = "/{id}")
    public Escala buscarPorId(@PathVariable("id") Long id) {
        System.out.println("Recebendo requisição no Java para buscar a escala ID: " + id);
        return escalaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escala com o ID " + id + " não foi encontrada no banco."));
    }

    // 4. LISTAR TODAS: Para o Administrador ver a lista de escalas criadas
    @GetMapping
    public List<Escala> listarTodas() {
        return escalaRepository.findAll();
    }

    // 5. EDITAR ITEM: Para o Admin trocar um militar manualmente no React
    @PutMapping("/item/{itemId}")
    public EscalaItem editarItemManual(@PathVariable Long itemId, @RequestBody EscalaItem itemAtualizado) {
        EscalaItem itemExistente = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item da escala não encontrado"));

        // Permite ao admin alterar o militar escalado ou a observação (ex: "Safar pane")
        itemExistente.setMilitar(itemAtualizado.getMilitar());
        itemExistente.setObservacao(itemAtualizado.getObservacao());

        return itemRepository.save(itemExistente);
    }
}