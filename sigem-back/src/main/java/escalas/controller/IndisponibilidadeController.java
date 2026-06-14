package escalas.controller;

import escalas.model.Indisponibilidade;
import escalas.service.IndisponibilidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/indisponibilidades")
public class IndisponibilidadeController {

    @Autowired
    private IndisponibilidadeService service;

    @PostMapping("/militar/{militarId}")
    public Indisponibilidade cadastrar(@PathVariable Long militarId, @RequestBody Indisponibilidade indisponibilidade) {
        // Passa a bola direto para o Service resolver
        return service.cadastrar(militarId, indisponibilidade);
    }

    @GetMapping("/militar/{militarId}")
    public List<Indisponibilidade> listarDoMilitar(@PathVariable Long militarId) {
        return service.listarDoMilitar(militarId);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}