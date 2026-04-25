package com.payrollpulse.controller;

import com.payrollpulse.dto.LeaveRequestDTO;
import com.payrollpulse.dto.LeaveResponseDTO;
import com.payrollpulse.dto.LeaveStatusUpdateDTO;
import com.payrollpulse.services.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') and @authorizationService.isCurrentUser(#requestDTO.employeeId)")
    public ResponseEntity<LeaveResponseDTO> applyLeave(@Valid @RequestBody LeaveRequestDTO requestDTO) {
        LeaveResponseDTO response = leaveService.applyLeave(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeaveResponseDTO> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateDTO statusUpdateDTO) {
        LeaveResponseDTO response = leaveService.updateLeaveStatus(id, statusUpdateDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isCurrentUser(#employeeId)")
    public ResponseEntity<List<LeaveResponseDTO>> getLeavesByEmployee(@PathVariable Long employeeId) {
        List<LeaveResponseDTO> response = leaveService.getLeavesByEmployee(employeeId);
        return ResponseEntity.ok(response);
    }
}