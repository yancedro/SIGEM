package escalas.controller;

import escalas.model.Militar;
import escalas.service.MilitarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> cadastrar(@RequestBody Militar militar) {
        try {
            Militar militarSalvo = service.cadastrar(militar);
            return ResponseEntity.status(201).body(militarSalvo); // 201 = Created
        } catch (IllegalArgumentException e) {
            // Se o Service barrar, o Controller devolve o erro 400 (Bad Request) com a mensagem
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno ao processar o cadastro.");
        }
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