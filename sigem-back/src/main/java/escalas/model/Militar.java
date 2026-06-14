package escalas.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "militar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Militar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String saram;

    @Column(length = 30)
    private String posto;

    @Column(length = 30)
    private String graduacao;

    @Column(name = "nome_completo", nullable = false, length = 150)
    private String nomeCompleto;

    @Column(name = "nome_guerra", length = 50)
    private String nomeGuerra;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String email;

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

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSaram() {
        return saram;
    }

    public void setSaram(String saram) {
        this.saram = saram;
    }

    public String getPosto() {
        return posto;
    }

    public void setPosto(String posto) {
        this.posto = posto;
    }

    public String getGraduacao() {
        return graduacao;
    }

    public void setGraduacao(String graduacao) {
        this.graduacao = graduacao;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getNomeGuerra() {
        return nomeGuerra;
    }

    public void setNomeGuerra(String nomeGuerra) {
        this.nomeGuerra = nomeGuerra;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataApresentacao() {
        return dataApresentacao;
    }

    public void setDataApresentacao(LocalDate dataApresentacao) {
        this.dataApresentacao = dataApresentacao;
    }

    public String getOmGrupo() {
        return omGrupo;
    }

    public void setOmGrupo(String omGrupo) {
        this.omGrupo = omGrupo;
    }

    public LocalDate getDataAntiguidade() {
        return dataAntiguidade;
    }

    public void setDataAntiguidade(LocalDate dataAntiguidade) {
        this.dataAntiguidade = dataAntiguidade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRestricaoMedica() {
        return restricaoMedica;
    }

    public void setRestricaoMedica(String restricaoMedica) {
        this.restricaoMedica = restricaoMedica;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}