package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "militar")
@Data // O Lombok já cria todos os Getters e Setters por nós!
@NoArgsConstructor
@AllArgsConstructor
public class Militar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CREDENCIAIS DE ACESSO ---
    @Column(nullable = false, unique = true, length = 10)
    private String saram; // O SARAM será o Login

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String perfil = "usuario"; // "usuario" (Tropa) ou "escalante" (Admin)

    // --- DADOS PESSOAIS ---
    @Column(unique = false, length = 14) // Ex: 000.000.000-00
    private String cpf;

    @Column(name = "nome_completo", nullable = false, length = 150)
    private String nomeCompleto;

    @Column(name = "nome_guerra", length = 50)
    private String nomeGuerra;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String email;

    // --- DADOS MILITARES ---
    @Column(length = 30)
    private String posto;

    @Column(length = 30)
    private String graduacao;

    @Column(name = "data_apresentacao", nullable = false)
    private LocalDate dataApresentacao;

    @Column(name = "om_grupo", length = 50)
    private String omGrupo;

    @Column(name = "data_antiguidade")
    private LocalDate dataAntiguidade;

    @Column(length = 20, columnDefinition = "varchar(20) default 'ATIVO'")
    private String status = "ATIVO";

    @Column(name = "restricao_medica", columnDefinition = "TEXT")
    private String restricaoMedica;

    // --- AUDITORIA ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}