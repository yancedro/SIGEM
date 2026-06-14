package escalas.controller;

import escalas.model.Usuario;
import escalas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // Apenas Escalantes deverão acessar este no futuro
    @PostMapping
    public Usuario cadastrar(@RequestBody Usuario usuario) {
        return service.cadastrarNovo(usuario);
    }

    // Rota para o militar mudar a própria senha
    @PatchMapping("/{id}/alterar-senha")
    public void mudarSenha(@PathVariable Long id, @RequestBody String novaSenha) {
        service.alterarSenha(id, novaSenha);
    }

    // Rota para delegar acesso (Dar o poder de Escalante)
    @PutMapping("/{id}/promover")
    public void promover(@PathVariable Long id) {
        service.promoverAEscalante(id);
    }
}