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
                // 1. ATIVA O CORS COM AS CONFIGURAÇÕES
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // 🚨 FASE DE DESENVOLVIMENTO: LIBERANDO ROTAS CRÍTICAS 🚨
                        // Declaramos as rotas COM e SEM "/**" para o Spring 6 não dar 403
                        .requestMatchers("/api/militares", "/api/militares/**").permitAll()

                        .requestMatchers("/api/servicos", "/api/servicos/**").permitAll()
                        .requestMatchers("/api/lastros", "/api/lastros/**").permitAll()
                        .requestMatchers("/api/escalas", "/api/escalas/**").permitAll()
                        .requestMatchers("/api/quadrinhos", "/api/quadrinhos/**").permitAll()

                        // (Rotas futuras de permissão de Escalante comentadas por enquanto)
                        // .requestMatchers(HttpMethod.POST, "/api/usuarios").hasAuthority("ESCALANTE")
                        // .requestMatchers(HttpMethod.PUT, "/api/usuarios/*/promover").hasAuthority("ESCALANTE")

                        // Qualquer outra rota não listada acima será bloqueada
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // 2. EXPLICITA AS REGRAS DE CORS
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173")); // Seu Front-end
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}