package escalas.service;

import escalas.model.Indisponibilidade;
import escalas.model.Militar;
import escalas.repository.IndisponibilidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IndisponibilidadeService {

    @Autowired
    private IndisponibilidadeRepository repository;

    @Autowired
    private MilitarService militarService;

    // A MUDANÇA ESTÁ AQUI: Recebemos o ID direto da URL
    public Indisponibilidade cadastrar(Long militarId, Indisponibilidade indisponibilidade) {

        // Buscamos o militar usando o ID limpo, sem precisar dar getMilitar()
        Militar militar = militarService.buscarPorId(militarId);

        // Agora sim, colocamos o militar verdadeiro dentro da indisponibilidade
        indisponibilidade.setMilitar(militar);

        // Validação das datas
        if (indisponibilidade.getDataFim().isBefore(indisponibilidade.getDataInicio())) {
            throw new RuntimeException("Erro: A data final não pode ser anterior à data inicial.");
        }

        return repository.save(indisponibilidade);
    }

    public List<Indisponibilidade> listarDoMilitar(Long militarId) {
        return repository.findByMilitarId(militarId);
    }

    public void excluir(Long id) {
        Indisponibilidade ind = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Indisponibilidade não encontrada."));
        repository.delete(ind);
    }
}