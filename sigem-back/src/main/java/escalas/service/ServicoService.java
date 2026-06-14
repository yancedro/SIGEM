package escalas.service;

import escalas.model.Servico;
import escalas.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository repository;

    public Servico cadastrar(Servico servico) {
        // Regra de Negócio: Não pode ter dois serviços com o mesmo código
        Optional<Servico> servicoExistente = repository.findByCodigo(servico.getCodigo());

        if (servicoExistente.isPresent()) {
            throw new RuntimeException("Erro: Já existe um serviço cadastrado com o código " + servico.getCodigo());
        }

        return repository.save(servico);
    }

    public List<Servico> listarTodos() {
        return repository.findAll();
    }

    public Servico buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erro: Serviço não encontrado com o ID " + id));
    }

    public Servico atualizar(Long id, Servico servicoAtualizado) {
        Servico servicoExistente = buscarPorId(id);

        servicoExistente.setNome(servicoAtualizado.getNome());
        servicoExistente.setQuantidadePorDia(servicoAtualizado.getQuantidadePorDia());
        servicoExistente.setExigeSombra(servicoAtualizado.getExigeSombra());
        servicoExistente.setQuantidadeSombra(servicoAtualizado.getQuantidadeSombra());
        servicoExistente.setComumEspecifico(servicoAtualizado.getComumEspecifico());
        servicoExistente.setPreRequisito(servicoAtualizado.getPreRequisito());
        servicoExistente.setAtivo(servicoAtualizado.getAtivo());

        return repository.save(servicoExistente);
    }

    public void excluir(Long id) {
        Servico servicoExistente = buscarPorId(id);
        repository.delete(servicoExistente);
    }
}