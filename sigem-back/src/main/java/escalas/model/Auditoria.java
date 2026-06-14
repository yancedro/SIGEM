package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String usuario;

    @Column(nullable = false, length = 50)
    private String acao;

    @Column(nullable = false, length = 100)
    private String entidade;

    @Column(name = "id_registro", nullable = false)
    private Long idRegistro;

    @Column(name = "campo_alterado", length = 100)
    private String campoAlterado;

    @Column(name = "valor_antigo", columnDefinition = "TEXT")
    private String valorAntigo;

    @Column(name = "valor_novo", columnDefinition = "TEXT")
    private String valorNovo;

    @Column(length = 45)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "data_hora", updatable = false)
    private LocalDateTime dataHora = LocalDateTime.now();
}