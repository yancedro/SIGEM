package escalas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "servico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "quantidade_por_dia", columnDefinition = "integer default 1")
    private Integer quantidadePorDia = 1;

    @Column(name = "exige_sombra", columnDefinition = "boolean default false")
    private Boolean exigeSombra = false;

    @Column(name = "quantidade_sombra", columnDefinition = "integer default 0")
    private Integer quantidadeSombra = 0;

    @Column(name = "comum_especifico", length = 10, columnDefinition = "varchar(10) default 'COMUM'")
    private String comumEspecifico = "COMUM";

    @Column(name = "pre_requisito", columnDefinition = "TEXT")
    private String preRequisito;

    @Column(columnDefinition = "boolean default true")
    private Boolean ativo = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getQuantidadePorDia() {
        return quantidadePorDia;
    }

    public void setQuantidadePorDia(Integer quantidadePorDia) {
        this.quantidadePorDia = quantidadePorDia;
    }

    public Boolean getExigeSombra() {
        return exigeSombra;
    }

    public void setExigeSombra(Boolean exigeSombra) {
        this.exigeSombra = exigeSombra;
    }

    public Integer getQuantidadeSombra() {
        return quantidadeSombra;
    }

    public void setQuantidadeSombra(Integer quantidadeSombra) {
        this.quantidadeSombra = quantidadeSombra;
    }

    public String getComumEspecifico() {
        return comumEspecifico;
    }

    public void setComumEspecifico(String comumEspecifico) {
        this.comumEspecifico = comumEspecifico;
    }

    public String getPreRequisito() {
        return preRequisito;
    }

    public void setPreRequisito(String preRequisito) {
        this.preRequisito = preRequisito;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}