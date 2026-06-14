package escalas.controller;

import escalas.model.Militar;
import escalas.service.MilitarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/militares")
public class MilitarController {

    @Autowired
    private MilitarService service;

    // 1. LISTAR TODOS
    @GetMapping
    public List<Militar> listarTodos() {
        return service.listarTodos();
    }

    // 2. BUSCAR POR ID (Busca técnica)
    @GetMapping("/{id}")
    public Militar buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // 3. BUSCAR POR SARAM (Busca operacional)
    @GetMapping("/saram/{saram}")
    public Militar buscarPorSaram(@PathVariable String saram) {
        return service.buscarPorSaram(saram);
    }

    // 4. CADASTRAR NOVO MILITAR
    @PostMapping
    public Militar cadastrar(@RequestBody Militar militar) {
        return service.cadastrar(militar);
    }

    // 5. ATUALIZAR DADOS
    @PutMapping("/{id}")
    public Militar atualizar(@PathVariable Long id, @RequestBody Militar militar) {
        return service.atualizar(id, militar);
    }

    // 6. EXCLUIR REGISTRO
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}