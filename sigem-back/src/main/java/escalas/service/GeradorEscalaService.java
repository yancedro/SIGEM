package escalas.service;

import escalas.model.*;
import escalas.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeradorEscalaService {

    @Autowired
    private EscalaRepository escalaRepository;

    @Autowired
    private MilitarServicoRepository militarServicoRepository;

    @Autowired
    private IndisponibilidadeRepository indisponibilidadeRepository;

    @Autowired
    private EscalaItemRepository escalaItemRepository;

    @Autowired
    private QuadrinhoRepository quadrinhoRepository; // Agora injetado corretamente!

    public Escala gerarEscalaAutomatica(Long escalaId) {

        Escala escala = escalaRepository.findById(escalaId)
                .orElseThrow(() -> new RuntimeException("Erro: Escala não encontrada"));

        escala.getItens().clear();
        YearMonth anoMes = YearMonth.of(escala.getAno(), escala.getMes());
        int quantidadeDiasNoMes = anoMes.lengthOfMonth();

        List<MilitarServico> habilitacoes = militarServicoRepository.findByServicoId(escala.getServico().getId());
        List<Militar> militaresHabilitados = new ArrayList<>();
        for (MilitarServico ms : habilitacoes) {
            militaresHabilitados.add(ms.getMilitar());
        }

        // ====================================================================
        // INICIALIZAÇÃO DE QUADRINHOS (Histórico Real + Lastros Manuais)
        // ====================================================================
        Map<Long, LocalDate> ultimaVezEscalado = new HashMap<>();
        Map<Long, Double> mapaQuadrinhos = new HashMap<>();

        for (Militar m : militaresHabilitados) {
            // Busca a soma de todos os quadrinhos já registrados no banco para este militar
            Double totalAcumulado = quadrinhoRepository.somarValoresPorMilitarEServico(m.getId(), escala.getServico().getId());
            mapaQuadrinhos.put(m.getId(), totalAcumulado != null ? totalAcumulado : 0.0);
        }

        for (int dia = 1; dia <= quantidadeDiasNoMes; dia++) {
            LocalDate dataAtual = LocalDate.of(escala.getAno(), escala.getMes(), dia);
            Militar militarEscolhido = null;

            // Ordenação por Justiça (Menos quadrinhos primeiro)
            militaresHabilitados.sort((m1, m2) -> {
                Double q1 = mapaQuadrinhos.get(m1.getId());
                Double q2 = mapaQuadrinhos.get(m2.getId());
                if (!q1.equals(q2)) return Double.compare(q1, q2);

                LocalDate ultima1 = ultimaVezEscalado.getOrDefault(m1.getId(), LocalDate.MIN);
                LocalDate ultima2 = ultimaVezEscalado.getOrDefault(m2.getId(), LocalDate.MIN);
                return ultima1.compareTo(ultima2);
            });

            // Lógica de seleção (Cenário Ideal 1x2 -> Exceção 1x1 -> Buraco)
            for (Militar candidato : militaresHabilitados) {
                if (estaIndisponivel(candidato, dataAtual)) continue;
                LocalDate ultima = ultimaVezEscalado.get(candidato.getId());
                if (ultima != null && !ultima.isBefore(dataAtual.minusDays(2))) continue;
                militarEscolhido = candidato;
                break;
            }

            if (militarEscolhido == null) { // Tenta 1x1
                for (Militar candidato : militaresHabilitados) {
                    if (estaIndisponivel(candidato, dataAtual)) continue;
                    LocalDate ultima = ultimaVezEscalado.get(candidato.getId());
                    if (ultima != null && ultima.equals(dataAtual.minusDays(1))) continue;
                    militarEscolhido = candidato;
                    break;
                }
            }

            EscalaItem item = new EscalaItem();
            item.setEscala(escala);
            item.setData(dataAtual);
            item.setMilitar(militarEscolhido);
            escala.getItens().add(item);

            if (militarEscolhido != null) {
                ultimaVezEscalado.put(militarEscolhido.getId(), dataAtual);
                mapaQuadrinhos.put(militarEscolhido.getId(), mapaQuadrinhos.get(militarEscolhido.getId()) + 1.0);
            }
        }

        return escalaRepository.save(escala);
    }

    private boolean estaIndisponivel(Militar militar, LocalDate dataAtual) {
        List<Indisponibilidade> indisponibilidades = indisponibilidadeRepository.findByMilitarId(militar.getId());
        for (Indisponibilidade ind : indisponibilidades) {
            if (!dataAtual.isBefore(ind.getDataInicio()) && !dataAtual.isAfter(ind.getDataFim())) return true;
        }
        return false;
    }
}