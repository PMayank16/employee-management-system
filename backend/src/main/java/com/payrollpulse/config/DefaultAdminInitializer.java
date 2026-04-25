package com.payrollpulse.config;

import com.payrollpulse.entity.Employee;
import com.payrollpulse.enums.Role;
import com.payrollpulse.enums.SalaryType;
import com.payrollpulse.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DefaultAdminInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@company.com";
        if (employeeRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        Employee admin = Employee.builder()
                .name("System Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .salaryType(SalaryType.MONTHLY)
                .salaryAmount(BigDecimal.valueOf(100000))
                .build();

        employeeRepository.save(admin);
    }
}
