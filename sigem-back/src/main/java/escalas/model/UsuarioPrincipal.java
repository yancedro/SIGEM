package escalas.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class UsuarioPrincipal implements UserDetails {
    private Usuario usuario;

    public UsuarioPrincipal(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Converte o campo 'papel' (ESCALANTE/USUARIO_COMUM) em uma autoridade do Spring
        return Collections.singletonList(new SimpleGrantedAuthority(usuario.getPapel()));
    }

    @Override
    public String getPassword() { return usuario.getSenhaHash(); }

    @Override
    public String getUsername() { return usuario.getUsername(); } // Aqui será o CPF

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return usuario.getAtivo(); }
}