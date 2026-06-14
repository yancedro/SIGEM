package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quadrinho")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quadrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "militar_id", nullable = false)
    private Militar militar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escala_item_id")
    private EscalaItem escalaItem;

    @Column(name = "data_servico", nullable = false)
    private LocalDate dataServico;

    @Column(name = "horas_cumpridas", nullable = false)
    private Integer horasCumpridas;

    @Column(name = "atraso_horas", columnDefinition = "integer default 0")
    private Integer atrasoHoras = 0;

    @Column(name = "quadrinho_valor", precision = 5, scale = 2, columnDefinition = "decimal(5,2) default 1.0")
    private BigDecimal quadrinhoValor = BigDecimal.ONE;

    @Column(columnDefinition = "boolean default false")
    private Boolean sombra = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public void setEscalaItem(EscalaItem escalaItem) {
        this.escalaItem = escalaItem;
    }
}