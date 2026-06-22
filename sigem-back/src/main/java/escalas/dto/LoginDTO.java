package escalas.dto;

public class LoginDTO {
    private String saram;
    private String senha;
    private String perfil;

    // Getters e Setters (Obrigatorios para o Java conseguir ler o JSON)
    public String getSaram() {
        return saram;
    }

    public void setSaram(String saram) {
        this.saram = saram;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }
}