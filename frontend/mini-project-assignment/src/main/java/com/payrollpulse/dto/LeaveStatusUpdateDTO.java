package com.payrollpulse.dto;

import com.payrollpulse.enums.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private LeaveStatus status;
}