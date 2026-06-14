package escalas.controller;

import escalas.dto.MilitarQuadrinhoDTO;
import escalas.model.Quadrinho;
import escalas.repository.QuadrinhoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quadrinhos")
public class QuadrinhoController {

    @Autowired
    private QuadrinhoRepository repository;

    // Rota para a Janela: Mostra quanto cada militar tem acumulado
    @GetMapping("/resumo/{servicoId}")
    public List<MilitarQuadrinhoDTO> listarResumo(@PathVariable Long servicoId) {
        return repository.resumoPorServico(servicoId);
    }

    // Rota para o Botão "Adicionar Lastro": Cria um registro manual de ajuste
    @PostMapping("/lastro")
    public Quadrinho adicionarLastro(@RequestBody Quadrinho lastro) {
        // Garantimos que esse registro não está preso a nenhum dia específico da escala
        lastro.setEscalaItem(null);
        return repository.save(lastro);
    }
}