package escalas.controller;

import escalas.model.Militar;
import escalas.service.MilitarService;
import escalas.dto.LoginDTO; // Importando nosso novo blindador
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

    // 2. BUSCAR POR ID
    @GetMapping("/{id}")
    public Militar buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // 3. BUSCAR POR SARAM
    @GetMapping("/saram/{saram}")
    public Militar buscarPorSaram(@PathVariable String saram) {
        return service.buscarPorSaram(saram);
    }

    // 4. CADASTRAR NOVO MILITAR
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Militar militar) {
        try {
            Militar militarSalvo = service.cadastrar(militar);
            return ResponseEntity.status(201).body(militarSalvo);
        } catch (IllegalArgumentException e) {
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

    // =========================================================
    // 7. ROTA DE AUTENTICAÇÃO (LOGIN) - AGORA SÓ EXISTE UMA!
    // =========================================================
    @PostMapping("/login")
    public ResponseEntity<?> realizarLogin(@RequestBody LoginDTO dadosLogin) {
        Militar militarAutenticado = service.autenticar(
                dadosLogin.getSaram(),
                dadosLogin.getSenha(),
                dadosLogin.getPerfil()
        );

        if (militarAutenticado != null) {
            return ResponseEntity.ok(militarAutenticado);
        } else {
            return ResponseEntity.status(401).body("Acesso negado: Credenciais inválidas para este perfil.");
        }
    }
}