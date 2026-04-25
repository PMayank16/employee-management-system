package com.payrollpulse.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.payrollpulse.filter.JwtAuthenticationFilter;
import com.payrollpulse.security.JwtAccessDeniedHandler;
import com.payrollpulse.security.JwtAuthenticationEntryPoint;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.payrollpulse.security.CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/api/auth/**").permitAll()

                                // 👇 FIXED
                                .requestMatchers(HttpMethod.GET, "/api/employees/me").hasAnyRole("ADMIN", "EMPLOYEE")
                                .requestMatchers("/api/employees/**").hasRole("ADMIN")

                                .requestMatchers("/api/payroll/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/leaves/*/status").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/leaves").hasRole("EMPLOYEE")
                                .requestMatchers("/api/leaves/**").authenticated()
                                .requestMatchers("/api/attendance/**").authenticated()
                                .anyRequest().authenticated());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Support both local development and production (Vercel) origins
        // Configure via CORS_ORIGINS env variable (comma-separated)
        // Example: http://localhost:5173,https://employee-management-system-flax-gamma.vercel.app
        String corsOrigins = System.getenv("CORS_ORIGINS");
        if (corsOrigins != null && !corsOrigins.isBlank()) {
            List<String> allowedOrigins = List.of(corsOrigins.split(","));
            configuration.setAllowedOrigins(allowedOrigins);
        } else {
            // Fallback for local development AND production
            // Add your Vercel frontend URL here as fallback
            configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://employee-management-system-flax-gamma.vercel.app"
            ));
        }
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
