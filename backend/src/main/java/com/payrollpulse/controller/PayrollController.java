package com.payrollpulse.controller;

import com.payrollpulse.dto.PayrollResponseDTO;
import com.payrollpulse.services.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PayrollResponseDTO> calculatePayroll(@PathVariable Long employeeId) {
        PayrollResponseDTO response = payrollService.calculatePayroll(employeeId);
        return ResponseEntity.ok(response);
    }
}