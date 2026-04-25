package com.payrollpulse.services;

import com.payrollpulse.dto.EmployeeRequestDTO;
import com.payrollpulse.dto.EmployeeResponseDTO;
import com.payrollpulse.entity.Employee;
import com.payrollpulse.exception.ResourceNotFoundException;
import com.payrollpulse.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO requestDTO) {
        if (employeeRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Employee name already exists: " + requestDTO.getName());
        }
        if (employeeRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Employee email already exists: " + requestDTO.getEmail());
        }

        Employee employee = Employee.builder()
                .name(requestDTO.getName())
                .email(requestDTO.getEmail())
                .password(passwordEncoder.encode(requestDTO.getPassword()))
                .role(requestDTO.getRole())
                .salaryType(requestDTO.getSalaryType())
                .salaryAmount(requestDTO.getSalaryAmount())
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponseDTO(savedEmployee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public EmployeeResponseDTO getEmployeeProfileByEmail(String email) {
        Employee employee = getEmployeeByEmail(email);
        return mapToResponseDTO(employee);
    }

    private EmployeeResponseDTO mapToResponseDTO(Employee employee) {
        return EmployeeResponseDTO.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .salaryType(employee.getSalaryType())
                .salaryAmount(employee.getSalaryAmount())
                .build();
    }
}