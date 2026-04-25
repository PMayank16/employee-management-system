package com.payrollpulse.services;

import com.payrollpulse.dto.LeaveRequestDTO;
import com.payrollpulse.dto.LeaveResponseDTO;
import com.payrollpulse.dto.LeaveStatusUpdateDTO;
import com.payrollpulse.entity.Employee;
import com.payrollpulse.entity.Leave;
import com.payrollpulse.enums.LeaveStatus;
import com.payrollpulse.exception.ResourceNotFoundException;
import com.payrollpulse.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeService employeeService;

    @Transactional
    public LeaveResponseDTO applyLeave(LeaveRequestDTO requestDTO) {
        Employee employee = employeeService.getEmployeeById(requestDTO.getEmployeeId());

        // Validate date range
        if (requestDTO.getToDate().isBefore(requestDTO.getFromDate())) {
            throw new IllegalArgumentException("To date must be after from date");
        }

        Leave leave = Leave.builder()
                .employee(employee)
                .fromDate(requestDTO.getFromDate())
                .toDate(requestDTO.getToDate())
                .status(LeaveStatus.PENDING)
                .build();

        Leave savedLeave = leaveRepository.save(leave);
        return mapToResponseDTO(savedLeave, employee);
    }

    @Transactional
    public LeaveResponseDTO updateLeaveStatus(Long leaveId, LeaveStatusUpdateDTO statusUpdateDTO) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + leaveId));

        leave.setStatus(statusUpdateDTO.getStatus());
        Leave updatedLeave = leaveRepository.save(leave);
        return mapToResponseDTO(updatedLeave, leave.getEmployee());
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDTO> getLeavesByEmployee(Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId);

        return leaveRepository.findByEmployeeId(employeeId)
                .stream()
                .map(leave -> mapToResponseDTO(leave, employee))
                .collect(Collectors.toList());
    }

    private LeaveResponseDTO mapToResponseDTO(Leave leave, Employee employee) {
        return LeaveResponseDTO.builder()
                .id(leave.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .fromDate(leave.getFromDate())
                .toDate(leave.getToDate())
                .status(leave.getStatus())
                .build();
    }
}