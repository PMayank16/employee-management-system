# 🚀 Mini Payroll & Attendance System

A production-ready SaaS MVP built using **Spring Boot** and **Next.js (Vite)** to manage employees, attendance, leave, and payroll efficiently.

### 👨‍💼 Admin Login
- **Email:** admin@company.com  
- **Password:** admin123  

### 👥 System Flow
1. First login as **Admin**
2. Admin can create and manage employees
3. Employees can then login with their credentials
4. Role-based access for Admin & Employees

---

## 🧑‍💻 Tech Stack

- **Frontend:** React + Vite (Deployed on Vercel)
- **Backend:** Spring Boot (Java) (Deployed on Render)
- **Database:** PostgreSQL (Render)

---

## 🏗️ System Architecture

```
User → Next.js Frontend → Spring Boot REST API → PostgreSQL Database → Response
```

---

## 🗄️ Database Schema

### 👤 Employee
- id
- name
- role (WFH / Office / On-site)
- salaryType (Monthly / Daily)
- salaryAmount

### 📅 Attendance
- id
- employee_id (FK)
- date
- status (Present / Absent)

### 📝 Leave
- id
- employee_id (FK)
- start_date
- end_date
- status (Pending / Approved / Rejected)

### 💰 Payroll
- id
- employee_id (FK)
- month
- total_salary

---

## 🔗 API Endpoints

### 👤 Employee
- GET `/api/employees`
- POST `/api/employees`

### 📅 Attendance
- POST `/api/attendance`
- GET `/api/attendance/{employeeId}`

### 📝 Leave
- POST `/api/leave`
- PUT `/api/leave/{id}/approve`

### 💰 Payroll
- GET `/api/payroll/{employeeId}`

---

## 💰 Payroll Logic

### Monthly Salary Calculation
```
(Monthly Salary / 30) × Present Days
```

### Daily Wage Calculation
```
Daily Wage × Present Days
```

### Example
- Salary = 30000  
- Present Days = 20  
- Final Salary = (30000 / 30) × 20 = 20000  

---

## ⭐ Additional Feature

- ⏱️ Overtime Calculation  
  Extra working hours are converted into additional pay automatically.

---

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Live URLs

- **Frontend (Vercel):** https://employee-management-system-flax-gamma.vercel.app/
- **Backend (Render):** https://employee-management-system-1-vppm.onrender.com
- **Database (Render PostgreSQL):** https://dashboard.render.com

---

## 📌 Notes

- Make sure backend CORS is configured for frontend domain
- Environment variables must be set properly on Render & Vercel
- Admin must be seeded in database for first login

---
