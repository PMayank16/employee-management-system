package com.payrollpulse.controller;

import com.payrollpulse.dto.AttendanceRequestDTO;
import com.payrollpulse.dto.AttendanceResponseDTO;
import com.payrollpulse.services.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceResponseDTO> markAttendance(@Valid @RequestBody AttendanceRequestDTO requestDTO) {
        AttendanceResponseDTO response = attendanceService.markAttendance(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceResponseDTO>> markBulkAttendance(@Valid @RequestBody List<AttendanceRequestDTO> requestDTOList) {
        List<AttendanceResponseDTO> response = attendanceService.markBulkAttendance(requestDTOList);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or @authorizationService.isCurrentUser(#employeeId)")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByEmployee(@PathVariable Long employeeId) {
        List<AttendanceResponseDTO> response = attendanceService.getAttendanceByEmployee(employeeId);
        return ResponseEntity.ok(response);
    }
}