package com.payrollpulse.dto;

import com.payrollpulse.enums.Role;
import com.payrollpulse.enums.SalaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDTO {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private SalaryType salaryType;
    private BigDecimal salaryAmount;
}