package com.payrollpulse.dto;

import com.payrollpulse.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponseDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private LeaveStatus status;
}