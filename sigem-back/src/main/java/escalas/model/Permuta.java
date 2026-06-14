package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "permuta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escala_item_id", nullable = false)
    private EscalaItem escalaItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "militar_substituto_id")
    private Militar militarSubstituto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "militar_substituido_id")
    private Militar militarSubstituido;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Column(length = 30, columnDefinition = "varchar(30) default 'PENDENTE_CHEFE'")
    private String status = "PENDENTE_CHEFE";

    @Column(name = "data_solicitacao", updatable = false)
    private LocalDateTime dataSolicitacao = LocalDateTime.now();

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovado_por")
    private Usuario aprovadoPor;

    @Column(columnDefinition = "TEXT")
    private String observacao;
}