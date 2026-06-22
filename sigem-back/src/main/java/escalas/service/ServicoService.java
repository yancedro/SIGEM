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
        // Inteligência para gerar o código obrigatório automaticamente
        String codigoGerado = servico.getNome().toUpperCase().replaceAll("\\s+", "_");
        if (codigoGerado.length() > 20) {
            codigoGerado = codigoGerado.substring(0, 20);
        }

        // Verifica se a escala já existe
        Optional<Servico> existente = repository.findByCodigo(codigoGerado);
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Ação negada: Uma escala com este nome/código já existe.");
        }

        servico.setCodigo(codigoGerado);
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