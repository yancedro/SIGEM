package escalas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. ATIVA O CORS COM AS CONFIGURAÇÕES QUE DEFINIREMOS ABAIXO
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Mantive suas regras originais
                        .requestMatchers(HttpMethod.GET, "/api/escalas/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/quadrinhos/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/indisponibilidades/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/escalas/**").hasAuthority("ESCALANTE")
                        .requestMatchers(HttpMethod.PUT, "/api/escalas/**").hasAuthority("ESCALANTE")
                        .requestMatchers(HttpMethod.POST, "/api/quadrinhos/lastro").hasAuthority("ESCALANTE")
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasAuthority("ESCALANTE")
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/*/promover").hasAuthority("ESCALANTE")

                        .requestMatchers(HttpMethod.PATCH, "/api/usuarios/*/alterar-senha").authenticated()

                        .anyRequest().authenticated()
                )
                .httpBasic(org.springframework.security.config.Customizer.withDefaults());

        return http.build();
    }

    // 2. DEFINE EXPLICITAMENTE AS REGRAS DE CORS DENTRO DA SEGURANÇA
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173")); // Seu Front-end
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true); // Necessário para Basic Auth (Auth header)

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Define que usaremos BCrypt para criptografar as senhas no banco
        return new BCryptPasswordEncoder();
    }
}