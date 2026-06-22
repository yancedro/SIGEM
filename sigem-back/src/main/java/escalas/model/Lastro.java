package escalas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "militar_servico")
public class Lastro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "militar_id")
    private Militar militar;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Militar getMilitar() { return militar; }
    public void setMilitar(Militar militar) { this.militar = militar; }
    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }
}