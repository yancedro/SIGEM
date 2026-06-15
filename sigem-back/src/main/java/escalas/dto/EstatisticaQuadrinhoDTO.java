package escalas.dto;
public class EstatisticaQuadrinhoDTO {
    private String graduacao;
    private String nomeGuerra;
    private int pretos;
    private int vermelhos;
    private int total;

    public EstatisticaQuadrinhoDTO(String graduacao, String nomeGuerra, int pretos, int vermelhos) {
        this.graduacao = graduacao;
        this.nomeGuerra = nomeGuerra;
        this.pretos = pretos;
        this.vermelhos = vermelhos;
        this.total = pretos + vermelhos;
    }

    // Getters
    public String getGraduacao() { return graduacao; }
    public String getNomeGuerra() { return nomeGuerra; }
    public int getPretos() { return pretos; }
    public int getVermelhos() { return vermelhos; }
    public int getTotal() { return total; }
}