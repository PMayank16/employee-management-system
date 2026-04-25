# PayrollPulse Frontend (React + Vite)

Frontend admin/employee panel for Payroll Management with JWT auth and role-based routing.

## Setup Instructions

### Prerequisites

- Node.js 18+
- Spring Boot backend running (default base URL used here: `http://localhost:8000`)

### Install dependencies

```bash
npm install
```

### Environment

Create `.env` in project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Run dev server

```bash
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm run build
npm run preview
```

## API Endpoints Mapped (Frontend -> Backend)

### Auth

- `POST /api/auth/login`

### Employees

- `POST /api/employees` (admin)
- `GET /api/employees` (admin)
- `GET /api/employees/me` (admin/employee)

### Attendance

- `POST /api/attendance` (admin)
- `POST /api/attendance/bulk` (admin)
- `GET /api/attendance/{employeeId}`

### Leaves

- `POST /api/leaves` (employee apply)
- `PUT /api/leaves/{id}/status` (admin approve/reject)
- `GET /api/leaves/employee/{employeeId}`

### Payroll

- `GET /api/payroll/{employeeId}`

## Architecture Decisions

1. **Central API layer**  
   All network calls are in `src/services/api.js`, with a shared axios instance.

2. **JWT auth via context**  
   `src/hooks/useAuth.jsx` handles token/user state, bootstrap, login/logout, and role checks.

3. **Role-based route guards**  
   `ProtectedRoute`, `AdminRoute`, and `EmployeeRoute` enforce access by role.

4. **Role-specific navigation**  
   Sidebar entries are rendered based on current user role.

5. **Reusable UI components**  
   Shared components in `src/components/ui` keep pages consistent and modular.

6. **Frontend-only employee filtering**  
   `src/utils/employeeFilter.js` ensures `ADMIN` users are hidden from employee lists/tables where required.

## Assumptions

1. JWT returned by login is valid and accepted in `Authorization: Bearer <token>`.
2. `/api/employees/me` returns current user profile with at least `id`, `email`, and `role`.
3. Role values are case-insensitive (`ADMIN`, `admin`, `ROLE_ADMIN`, etc. are normalized).
4. Payroll endpoint returns fields needed for UI breakdown (e.g., salary type, base salary, present days, final salary).
5. Backend CORS allows `http://localhost:5173`.

## Auth and Role Flow

1. Login from `/login` with email + password.
2. Save token in localStorage.
3. Axios interceptor appends bearer token automatically.
4. Fetch `/api/employees/me` for profile.
5. Route + UI rendering happen by role:
   - Admin pages for admin only
   - Employee pages for employee only

## Troubleshooting

### Network Error

- Ensure backend is running on `VITE_API_BASE_URL`.
- Check CORS settings for `http://localhost:5173`.

### 401 / 403 errors

- Verify token validity and role authorities in backend.
- Confirm user has permission for endpoint being called.

### Employee profile not loading

- Verify `/api/employees/me` returns profile with `id`.
- Clear localStorage token/user and login again.
