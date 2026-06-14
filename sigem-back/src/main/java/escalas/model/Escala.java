package escalas.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "escala", uniqueConstraints = {
        // Ajustado: Agora o banco entende que não pode repetir Mês + Ano + Serviço + Tipo
        @UniqueConstraint(columnNames = {"mes", "ano", "servico_id", "tipo"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Escala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer mes;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false, length = 20)
    private String tipo; // PROVISORIA, DEFINITIVA

    // ====== NOVOS CAMPOS ADICIONADOS ======

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico; // Diz de quem é esta escala

    @OneToMany(mappedBy = "escala", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EscalaItem> itens = new ArrayList<>(); // Guarda os militares escalados dia a dia

    // ======================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gerada_por")
    private Usuario geradaPor;

    @Column(name = "data_geracao", updatable = false)
    private LocalDateTime dataGeracao = LocalDateTime.now();

    @Column(name = "confirmada_em")
    private LocalDateTime confirmadaEm;

    // GETTERS E SETTERS

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public List<EscalaItem> getItens() { return itens; }
    public void setItens(List<EscalaItem> itens) { this.itens = itens; }

    public Usuario getGeradaPor() { return geradaPor; }
    public void setGeradaPor(Usuario geradaPor) { this.geradaPor = geradaPor; }

    public LocalDateTime getDataGeracao() { return dataGeracao; }
    public void setDataGeracao(LocalDateTime dataGeracao) { this.dataGeracao = dataGeracao; }

    public LocalDateTime getConfirmadaEm() { return confirmadaEm; }
    public void setConfirmadaEm(LocalDateTime confirmadaEm) { this.confirmadaEm = confirmadaEm; }
}