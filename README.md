# 🚀 Mini Payroll & Attendance System

A production-ready SaaS MVP built using Spring Boot and Next.js to manage employees, attendance, leave, and payroll.

---

## 🧑‍💻 Tech Stack

Frontend: React + Vite (Vercel)
Backend: Spring Boot (Java) (Render)
Database: PostgreSQL (Render)

---


## 🏗️ System Architecture

User → Next.js Frontend → Spring Boot REST API → PostgreSQL Database → Response

---

## 🗄️ Database Schema

### Employee

* id
* name
* role (WFH / Office / On-site)
* salaryType (Monthly / Daily)
* salaryAmount

### Attendance

* id
* employee_id (FK)
* date
* status (Present / Absent)

### Leave

* id
* employee_id (FK)
* start_date
* end_date
* status (Pending / Approved / Rejected)

### Payroll

* id
* employee_id (FK)
* month
* total_salary

---

## 🔗 API Endpoints

### Employee

GET /api/employees
POST /api/employees

### Attendance

POST /api/attendance
GET /api/attendance/{employeeId}

### Leave

POST /api/leave
PUT /api/leave/{id}/approve

### Payroll

GET /api/payroll/{employeeId}

---

## 💰 Payroll Logic

Monthly Salary:
(Monthly Salary / 30) × Present Days

Daily Wage:
Daily Wage × Present Days

Example:
Salary = 30000, Present Days = 20
Final Salary = (30000 / 30) × 20 = 20000

---

## ⭐ Additional Feature

* Overtime Calculation: Extra working hours are converted into additional pay.

---

## ⚙️ Setup Instructions

### Backend

cd backend
./mvnw spring-boot:run

### Frontend

cd frontend
npm install
npm run dev

---

## 🌍 Live URLs

Frontend (Vercel): https://employee-management-system-flax-gamma.vercel.app/
Backend (Render): https://employee-management-system-1-vppm.onrender.com
Database (Render PostgreSQL): https://dashboard.render.com

---


