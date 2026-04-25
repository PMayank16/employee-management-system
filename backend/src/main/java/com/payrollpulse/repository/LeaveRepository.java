package com.payrollpulse.repository;

import com.payrollpulse.entity.Leave;
import com.payrollpulse.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeId(Long employeeId);

    List<Leave> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
}