package escalas.controller;

import escalas.model.MilitarServico;
import escalas.service.MilitarServicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elegibilidade") // Rota diferente para ficar organizado
public class MilitarServicoController {

    @Autowired
    private MilitarServicoService service;

    // Rota para habilitar: Ex: /api/elegibilidade/militar/1/servico/1
    @PostMapping("/militar/{militarId}/servico/{servicoId}")
    public MilitarServico habilitar(@PathVariable Long militarId, @PathVariable Long servicoId) {
        return service.habilitarMilitar(militarId, servicoId);
    }

    // Rota para ver o que um militar pode fazer: Ex: /api/elegibilidade/militar/1
    @GetMapping("/militar/{militarId}")
    public List<MilitarServico> listarDoMilitar(@PathVariable Long militarId) {
        return service.listarServicosDoMilitar(militarId);
    }
}