package escalas.service;

import escalas.model.Militar;
import escalas.repository.MilitarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MilitarService {

    @Autowired
    private MilitarRepository repository;

    public Militar cadastrar(Militar militar) {
        Optional<Militar> militarExistente = repository.findBySaram(militar.getSaram());
        if (militarExistente.isPresent()) {
            throw new RuntimeException("Erro: Já existe um militar cadastrado com o SARAM " + militar.getSaram());
        }
        return repository.save(militar);
    }

    public List<Militar> listarTodos() {
        return repository.findAll();
    }

    // 1. BUSCAR POR ID
    public Militar buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erro: Militar não encontrado com o ID " + id));
    }
    //buscar por saram
    public Militar buscarPorSaram(String saram) {
        return repository.findBySaram(saram)
                .orElseThrow(() -> new RuntimeException("Erro: Militar não encontrado com o SARAM " + saram));
    }

    // 2. ATUALIZAR (EDITAR)
    public Militar atualizar(Long id, Militar militarAtualizado) {
        Militar militarExistente = buscarPorId(id);

        militarExistente.setPosto(militarAtualizado.getPosto());
        militarExistente.setGraduacao(militarAtualizado.getGraduacao());
        militarExistente.setNomeGuerra(militarAtualizado.getNomeGuerra());
        militarExistente.setTelefone(militarAtualizado.getTelefone());
        militarExistente.setRestricaoMedica(militarAtualizado.getRestricaoMedica());
        militarExistente.setStatus(militarAtualizado.getStatus());

        return repository.save(militarExistente);
    }

    // 3. EXCLUIR
    public void excluir(Long id) {
        Militar militarExistente = buscarPorId(id);
        repository.delete(militarExistente);
    }

}