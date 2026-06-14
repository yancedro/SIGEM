package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "militar_servico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MilitarServico {

    @EmbeddedId
    private MilitarServicoId id = new MilitarServicoId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("militarId")
    @JoinColumn(name = "militar_id")
    private Militar militar;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("servicoId")
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Column(columnDefinition = "boolean default true")
    private Boolean habilitado = true;

    @Column(name = "data_habilitacao")
    private LocalDate dataHabilitacao;

    public MilitarServicoId getId() {
        return id;
    }

    public void setId(MilitarServicoId id) {
        this.id = id;
    }

    public Militar getMilitar() {
        return militar;
    }

    public void setMilitar(Militar militar) {
        this.militar = militar;
    }

    public Servico getServico() {
        return servico;
    }

    public void setServico(Servico servico) {
        this.servico = servico;
    }

    public Boolean getHabilitado() {
        return habilitado;
    }

    public void setHabilitado(Boolean habilitado) {
        this.habilitado = habilitado;
    }

    public LocalDate getDataHabilitacao() {
        return dataHabilitacao;
    }

    public void setDataHabilitacao(LocalDate dataHabilitacao) {
        this.dataHabilitacao = dataHabilitacao;
    }

    public void setHabilitado(boolean b) {
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilitarServicoId implements Serializable {
        @Column(name = "militar_id")
        private Long militarId;

        @Column(name = "servico_id")
        private Long servicoId;

    }
}