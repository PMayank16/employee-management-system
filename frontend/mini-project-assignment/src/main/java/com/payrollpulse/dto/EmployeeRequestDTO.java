package com.payrollpulse.dto;

import com.payrollpulse.enums.Role;
import com.payrollpulse.enums.SalaryType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Salary type is required")
    private SalaryType salaryType;

    @NotNull(message = "Salary amount is required")
    @Positive(message = "Salary amount must be positive")
    @Digits(integer = 8, fraction = 2, message = "Salary amount must be a valid decimal")
    private BigDecimal salaryAmount;
}