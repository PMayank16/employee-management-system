package com.payrollpulse.services;

import com.payrollpulse.dto.PayrollResponseDTO;
import com.payrollpulse.entity.Employee;
import com.payrollpulse.enums.AttendanceStatus;
import com.payrollpulse.enums.SalaryType;
import com.payrollpulse.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final EmployeeService employeeService;
    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public PayrollResponseDTO calculatePayroll(Long employeeId) {
        Employee employee = employeeService.getEmployeeById(employeeId);

        // Get current month date range
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        // Calculate total days in current month
        int totalDays = currentMonth.lengthOfMonth();

        // Get present and absent days
        long presentDays = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(
                employeeId, AttendanceStatus.PRESENT, startDate, endDate);

        long absentDays = attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(
                employeeId, AttendanceStatus.ABSENT, startDate, endDate);

        // Calculate salary based on salary type
        BigDecimal calculatedSalary = calculateSalary(employee, (int) presentDays);

        return PayrollResponseDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .totalDays(totalDays)
                .presentDays((int) presentDays)
                .absentDays((int) absentDays)
                .calculatedSalary(calculatedSalary)
                .build();
    }

    private BigDecimal calculateSalary(Employee employee, int presentDays) {
        BigDecimal salaryAmount = employee.getSalaryAmount();

        if (employee.getSalaryType() == SalaryType.MONTHLY) {
            // Monthly: (salaryAmount / 30) * presentDays
            BigDecimal dailyRate = salaryAmount.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
            return dailyRate.multiply(BigDecimal.valueOf(presentDays)).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Daily: salaryAmount * presentDays
            return salaryAmount.multiply(BigDecimal.valueOf(presentDays)).setScale(2, RoundingMode.HALF_UP);
        }
    }
}