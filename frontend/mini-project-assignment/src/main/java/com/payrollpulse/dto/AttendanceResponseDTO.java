package com.payrollpulse.dto;

import com.payrollpulse.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponseDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private AttendanceStatus status;
}