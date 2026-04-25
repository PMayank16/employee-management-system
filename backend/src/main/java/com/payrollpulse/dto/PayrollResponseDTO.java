package com.payrollpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponseDTO {

    private Long employeeId;
    private String employeeName;
    private Integer totalDays;
    private Integer presentDays;
    private Integer absentDays;
    private BigDecimal calculatedSalary;
}