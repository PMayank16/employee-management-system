package com.payrollpulse.services;

import com.payrollpulse.dto.AttendanceRequestDTO;
import com.payrollpulse.dto.AttendanceResponseDTO;
import com.payrollpulse.entity.Attendance;
import com.payrollpulse.entity.Employee;
import com.payrollpulse.exception.ResourceNotFoundException;
import com.payrollpulse.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeService employeeService;

    @Transactional
    public AttendanceResponseDTO markAttendance(AttendanceRequestDTO requestDTO) {
        Employee employee = employeeService.getEmployeeById(requestDTO.getEmployeeId());

        // Check if attendance already exists for this employee and date
        attendanceRepository.findByEmployeeIdAndDate(employee.getId(), requestDTO.getDate())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Attendance already marked for this date");
                });

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(requestDTO.getDate())
                .status(requestDTO.getStatus())
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToResponseDTO(savedAttendance, employee);
    }

    @Transactional
    public List<AttendanceResponseDTO> markBulkAttendance(List<AttendanceRequestDTO> requestDTOList) {
        return requestDTOList.stream()
                .map(this::markAttendance)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByEmployee(Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId);

        return attendanceRepository.findByEmployeeId(employeeId)
                .stream()
                .map(attendance -> mapToResponseDTO(attendance, employee))
                .collect(Collectors.toList());
    }

    private AttendanceResponseDTO mapToResponseDTO(Attendance attendance, Employee employee) {
        return AttendanceResponseDTO.builder()
                .id(attendance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .build();
    }
}