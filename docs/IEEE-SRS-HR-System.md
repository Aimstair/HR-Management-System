# Software Requirements Specification (SRS)

## IEEE-Style Specification

Document Title: HR Management System SRS  
Document ID: SRS-HR-001  
Version: 1.0.0  
Date: 2026-04-15  
Status: Baseline (Implementation-Aligned)

---

## 1. Introduction

### 1.1 Purpose
This document defines the formal software requirements for the HR Management System currently implemented in this repository. It provides functional and non-functional requirements, expanded acceptance criteria, and a complete traceability matrix mapping route to component, API, and data entity.

### 1.2 Scope
The system provides:
- Authentication and session lifecycle management.
- Employee self-service workflows for attendance, requests, memos, evaluations, and profile.
- Admin workflows for dashboard monitoring, employee management, request management, organization view, shift assignment, memo management, and reporting.
- Role-based access control with scope-aware data restrictions.

### 1.3 Intended Audience
- Product owners and business stakeholders.
- Engineering and QA teams.
- Technical leads and architects.
- Compliance and audit reviewers.

### 1.4 Definitions, Acronyms, and Abbreviations
- SRS: Software Requirements Specification.
- RBAC: Role-Based Access Control.
- JWT: JSON Web Token.
- API: Application Programming Interface.
- AC: Acceptance Criteria.
- FR: Functional Requirement.
- NFR: Non-Functional Requirement.

### 1.5 References
- Frontend route map: src/App.tsx
- Auth context and session behavior: src/context/AuthContext.tsx
- Main backend app composition: server/src/app.ts
- Backend data model: server/prisma/schema.prisma
- Backend auth routes: server/src/routes/auth.ts
- Backend admin routes:
  - server/src/routes/admin-dashboard.ts
  - server/src/routes/admin-employees.ts
  - server/src/routes/admin-requests.ts

### 1.6 Document Overview
Section 2 describes system context and constraints. Section 3 defines interfaces. Section 4 defines functional requirements with acceptance criteria. Section 5 defines data requirements. Section 6 defines non-functional requirements with acceptance criteria. Section 7 provides the full route traceability matrix.

---

## 2. Overall Description

### 2.1 Product Perspective
The product is a web-based HR platform implemented as:
- Frontend SPA: React + TypeScript + Vite.
- Backend API: Express + TypeScript + Prisma.
- Data Store: PostgreSQL (Supabase deployment target).

### 2.2 Product Functions (High-Level)
- User authentication, token issuance, refresh, and logout.
- Role-aware route protection and navigation.
- Employee portal workflows.
- Admin dashboard KPIs and listings.
- Admin employee CRUD and activation management.
- Admin request review and status updates (single and bulk).
- Admin reporting pages and export-capable report views.

### 2.3 User Classes and Characteristics
1. Employee (`ROLE_EMPLOYEE`)
- Uses portal features for self-service.
- Access restricted to employee routes.

2. Head Admin (`ROLE_HEAD_ADMIN`)
- Global administrative visibility and operations.

3. School Admin (`ROLE_SCHOOL_ADMIN`)
- Administrative visibility and operations limited to a school scope.

4. Department Admin (`ROLE_DEPARTMENT_ADMIN`)
- Administrative visibility and operations limited to a department scope.

### 2.4 Operating Environment
- Client: modern evergreen browsers.
- Frontend development server: Vite at port 3000.
- Backend development server: Express at port 4000.
- Frontend-to-backend proxy: `/api` via Vite proxy.

### 2.5 Design and Implementation Constraints
- TypeScript is used across frontend and backend.
- Prisma data model governs persistent entities.
- JWT access token and cookie-based refresh token pattern is mandatory.
- RBAC and admin scope filtering are mandatory for protected admin operations.

### 2.6 Assumptions and Dependencies
- Supabase PostgreSQL credentials are configured correctly.
- Environment variables pass runtime validation.
- Some frontend modules currently use local/mock data and are not fully backend-persisted.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- Responsive web interface with role-aware layouts.
- Shared layout shell includes sidebar navigation and route metadata header.
- Dialog-driven interactions for request filing, attendance edits, report filtering, exports, and memo actions.

### 3.2 Software Interfaces
- Frontend communicates to backend via REST under `/api`.
- Frontend auth client: `src/lib/auth-api.ts`.
- Frontend admin client: `src/lib/admin-api.ts`.
- Backend ORM interface: Prisma client.

### 3.3 Communication Interfaces
- HTTP/HTTPS JSON APIs.
- Access token in `Authorization: Bearer <token>`.
- Refresh token in `httpOnly` cookie scoped to `/api/auth`.

### 3.4 Security Interfaces
- Login validates credentials and account activity.
- Refresh rotates refresh token and invalidates previous token record.
- Logout revokes refresh token.
- Protected endpoints require valid JWT and role validation.

---

## 4. System Features and Functional Requirements

## 4.1 Authentication and Session Management

### FR-AUTH-001: Login
The system shall authenticate a user using email and password and issue an access token and refresh cookie.

Acceptance Criteria:
- AC-AUTH-001.1: Valid credentials return HTTP 200 with `accessToken` and `user` payload.
- AC-AUTH-001.2: Invalid credentials return HTTP 401.
- AC-AUTH-001.3: Inactive user accounts return HTTP 403.
- AC-AUTH-001.4: Successful login sets `refreshToken` cookie.

### FR-AUTH-002: Session Hydration
The frontend shall hydrate user session state from access token and `/auth/me`, with refresh fallback when needed.

Acceptance Criteria:
- AC-AUTH-002.1: On startup with valid token, `/api/auth/me` restores user state.
- AC-AUTH-002.2: On expired access token with valid refresh token, `/api/auth/refresh` restores session.
- AC-AUTH-002.3: On failure of both, user is treated as logged out.

### FR-AUTH-003: Refresh Token Rotation
The backend shall rotate refresh tokens on successful refresh.

Acceptance Criteria:
- AC-AUTH-003.1: Refresh endpoint revokes current token record and creates a new one.
- AC-AUTH-003.2: A revoked or expired refresh token returns HTTP 401.
- AC-AUTH-003.3: Inactive user during refresh returns HTTP 403.

### FR-AUTH-004: Logout
The system shall allow users to log out and invalidate refresh session continuity.

Acceptance Criteria:
- AC-AUTH-004.1: Logout returns HTTP 204.
- AC-AUTH-004.2: Logout clears refresh cookie.
- AC-AUTH-004.3: Associated refresh token record is marked revoked when present.

## 4.2 Authorization and Scope Control

### FR-RBAC-001: Route Protection
The system shall enforce frontend route-level role restrictions.

Acceptance Criteria:
- AC-RBAC-001.1: Employee routes are inaccessible to admin roles.
- AC-RBAC-001.2: Admin routes are inaccessible to employees.
- AC-RBAC-001.3: Unauthenticated access is redirected to login.

### FR-RBAC-002: API Role Validation
The backend shall enforce role checks on protected admin endpoints.

Acceptance Criteria:
- AC-RBAC-002.1: Admin endpoints reject missing authentication with HTTP 401.
- AC-RBAC-002.2: Admin endpoints reject non-admin roles with HTTP 403.

### FR-RBAC-003: Scope Filtering
The backend shall enforce admin scope filtering for school and department admins.

Acceptance Criteria:
- AC-RBAC-003.1: School admin reads and writes are limited to assigned school.
- AC-RBAC-003.2: Department admin reads and writes are limited to assigned department.
- AC-RBAC-003.3: Out-of-scope filters or mutations return HTTP 403.

## 4.3 Employee Portal Features

### FR-EMP-001: Employee Dashboard
The system shall provide an employee dashboard with attendance/request/memo summary indicators.

Acceptance Criteria:
- AC-EMP-001.1: Dashboard renders summary cards and memo/request panels.
- AC-EMP-001.2: Data displayed reflects provider state for logged-in employee context.

### FR-EMP-002: Employee Profile
The system shall provide a profile view with section-level editable forms.

Acceptance Criteria:
- AC-EMP-002.1: Profile sections render with existing values.
- AC-EMP-002.2: Section edit mode supports save and cancel actions.

### FR-EMP-003: Attendance Monitoring and Edit Request Filing
The system shall allow employees to review attendance entries and submit attendance edit requests.

Acceptance Criteria:
- AC-EMP-003.1: Attendance list supports month filtering.
- AC-EMP-003.2: Attendance metrics include total work, late, and undertime aggregates.
- AC-EMP-003.3: Edit request dialog submission creates a new request record in provider state.

### FR-EMP-004: Request Filing and Tracking
The system shall support filing and tracking multiple employee request types.

Acceptance Criteria:
- AC-EMP-004.1: Request filing dialog supports dynamic fields by selected request type.
- AC-EMP-004.2: Submitted request is added with default `PENDING` status when unspecified.
- AC-EMP-004.3: Request list supports search and month/type filtering.

### FR-EMP-005: Memo Access
The system shall allow employees to browse and inspect memo details.

Acceptance Criteria:
- AC-EMP-005.1: Memo listing supports filters.
- AC-EMP-005.2: Memo detail dialog opens with selected memo content.

### FR-EMP-006: Evaluation View
The system shall provide evaluation summary and detail presentation for employees.

Acceptance Criteria:
- AC-EMP-006.1: Evaluation page renders summary cards and ratings.
- AC-EMP-006.2: Page supports period/context filtering where configured.

## 4.4 Admin Dashboard and Operations

### FR-ADM-001: Dashboard Metrics
The system shall provide admin dashboard metrics scoped to the admin role.

Acceptance Criteria:
- AC-ADM-001.1: `GET /api/admin/dashboard/metrics` returns `totalEmployees`, `pendingRequests`, `activeShifts`, and `recentMemos`.
- AC-ADM-001.2: Metric values are scope-filtered for school/department admins.

### FR-ADM-002: Employee Listing
The system shall provide employee listing with paging, filtering, search, and sorting.

Acceptance Criteria:
- AC-ADM-002.1: `GET /api/admin/employees` accepts `search`, `schoolId`, `departmentId`, `isActive`, `page`, `limit`, `sortBy`, and `sortDirection`.
- AC-ADM-002.2: Response includes `rows` and `pagination`.
- AC-ADM-002.3: Results are restricted by admin scope.

### FR-ADM-003: Employee Detail
The system shall provide employee detail retrieval by employee ID.

Acceptance Criteria:
- AC-ADM-003.1: `GET /api/admin/employees/:employeeId` returns employee data when in scope.
- AC-ADM-003.2: Out-of-scope or missing employee returns HTTP 404.

### FR-ADM-004: Employee Creation
The system shall allow admin creation of employee accounts.

Acceptance Criteria:
- AC-ADM-004.1: `POST /api/admin/employees` creates a `ROLE_EMPLOYEE` user.
- AC-ADM-004.2: Duplicate email returns HTTP 409.
- AC-ADM-004.3: Invalid school or department references return HTTP 400.
- AC-ADM-004.4: Out-of-scope target school/department returns HTTP 403.

### FR-ADM-005: Employee Update and Activation Control
The system shall allow admin updates and activate/deactivate controls for employees.

Acceptance Criteria:
- AC-ADM-005.1: `PATCH /api/admin/employees/:employeeId` updates allowed employee fields.
- AC-ADM-005.2: `PATCH /api/admin/employees/:employeeId/deactivate` toggles active state.
- AC-ADM-005.3: Out-of-scope changes return HTTP 403.

### FR-ADM-006: Request Listing
The system shall provide request listing with filtering and pagination.

Acceptance Criteria:
- AC-ADM-006.1: `GET /api/admin/requests` supports `search`, `type`, `status`, `schoolId`, `departmentId`, `page`, and `limit`.
- AC-ADM-006.2: Response includes `rows` and `pagination`.
- AC-ADM-006.3: Results are scope filtered.

### FR-ADM-007: Request Detail
The system shall provide request detail retrieval by request ID.

Acceptance Criteria:
- AC-ADM-007.1: `GET /api/admin/requests/:requestId` returns request detail when in scope.
- AC-ADM-007.2: Missing or out-of-scope request returns HTTP 404.

### FR-ADM-008: Request Status Update
The system shall allow admins to update request status for individual records.

Acceptance Criteria:
- AC-ADM-008.1: `PATCH /api/admin/requests/:requestId/status` updates `status`.
- AC-ADM-008.2: `reviewedById` is set when status is not `PENDING`.
- AC-ADM-008.3: `reviewedById` is cleared when status is `PENDING`.

### FR-ADM-009: Bulk Request Status Update
The system shall allow bulk request status updates for visible records.

Acceptance Criteria:
- AC-ADM-009.1: `PATCH /api/admin/requests/bulk-status` accepts up to 200 IDs.
- AC-ADM-009.2: Only visible, in-scope records are modified.
- AC-ADM-009.3: No visible IDs returns HTTP 404.

### FR-ADM-010: Admin Shift Management UI
The system shall provide shift assignment and status management in admin UI.

Acceptance Criteria:
- AC-ADM-010.1: Shift page provides week navigation and assignment table.
- AC-ADM-010.2: Assignment dialog supports default and custom date range selection.
- AC-ADM-010.3: Changes are applied to local state in current baseline.

### FR-ADM-011: Admin Memo Management UI
The system shall provide memo filtering, inspection, and creation in admin UI.

Acceptance Criteria:
- AC-ADM-011.1: Memo page supports search and date filters.
- AC-ADM-011.2: Memo detail dialog displays selected memo content.
- AC-ADM-011.3: Memo create dialog supports creating local memo entries in current baseline.

### FR-ADM-012: Reporting UI Suite
The system shall provide attendance, tardiness, evaluations, and request-report pages.

Acceptance Criteria:
- AC-ADM-012.1: Attendance report supports table/graph view and export dialogs.
- AC-ADM-012.2: Tardiness report supports period and status legend filters.
- AC-ADM-012.3: Evaluation report supports table/graph mode and period filters.
- AC-ADM-012.4: Request-report pages provide scope/date filter dialogs and type-specific add dialogs where implemented.

---

## 5. Data Requirements

### 5.1 Persistent Data Entities (Backend)
1. School
- Organizational school/campus record.

2. Department
- Organizational unit tied to school.

3. User
- Identity, role, profile, scope metadata, and status.

4. RequestRecord
- Employee request workflow record with status and reviewer linkage.

5. Shift
- Shift definition and scope ownership.

6. Memo
- Announcement with publication scope.

7. RefreshToken
- Hashed refresh token lifecycle records.

### 5.2 Frontend Local/Mock Domain Models (Current Baseline)
- EmployeeAttendanceEntry
- EmployeeRequestRecord
- EmployeeMemo
- Evaluation and report-row mock models in admin report modules

### 5.3 Data Integrity and Validation Rules
- Email uniqueness for user creation.
- School-department relationship consistency enforced on create/update.
- Role and scope constraints applied before list and mutation operations.
- Request status values constrained to allowed enum values.

---

## 6. Non-Functional Requirements

### NFR-SEC-001: Authentication Security
The system shall enforce authenticated access for protected APIs.

Acceptance Criteria:
- AC-NFR-SEC-001.1: Missing/invalid bearer token returns HTTP 401 on protected endpoints.
- AC-NFR-SEC-001.2: Refresh cookie is `httpOnly` and path-restricted to `/api/auth`.

### NFR-SEC-002: Authorization Security
The system shall enforce role and scope restrictions consistently.

Acceptance Criteria:
- AC-NFR-SEC-002.1: Non-admin users cannot access admin endpoints.
- AC-NFR-SEC-002.2: Out-of-scope admin operations are rejected with HTTP 403.

### NFR-REL-001: Error Handling
The system shall return structured API error responses.

Acceptance Criteria:
- AC-NFR-REL-001.1: Validation or domain errors map to appropriate HTTP status codes.
- AC-NFR-REL-001.2: Global error middleware handles unhandled route errors.

### NFR-PERF-001: List Endpoint Pagination
The system shall paginate heavy list endpoints.

Acceptance Criteria:
- AC-NFR-PERF-001.1: Employee and request list APIs require bounded `limit` values.
- AC-NFR-PERF-001.2: Responses include pagination metadata.

### NFR-MAIN-001: Type Safety and Modularity
The system shall preserve modular, typed implementation patterns.

Acceptance Criteria:
- AC-NFR-MAIN-001.1: Frontend and backend modules compile with TypeScript.
- AC-NFR-MAIN-001.2: Shared role/type enums are used in route guards and business logic.

### NFR-OPS-001: Configuration Validity
The backend shall validate required environment variables at startup.

Acceptance Criteria:
- AC-NFR-OPS-001.1: Missing required env values cause startup failure with explicit error.
- AC-NFR-OPS-001.2: `DATABASE_URL` is required, and `DIRECT_URL` is optional but validated when present.

---

## 7. Full Traceability Matrix (Route -> Component -> API -> Data Entity)

Legend:
- API: backend endpoints directly consumed by route behavior.
- Local: route behavior uses frontend provider/local mock data in current baseline.

| Route | Allowed Roles | Primary Component(s) | API Endpoint(s) | Primary Data Entity(ies) | Requirement IDs |
| --- | --- | --- | --- | --- | --- |
| /login | Public | LoginPage | POST /api/auth/login, POST /api/auth/refresh, GET /api/auth/me, POST /api/auth/logout | User, RefreshToken | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, FR-AUTH-004 |
| /portal/dashboard | ROLE_EMPLOYEE | EmployeeDashboard, DashboardStatCard, DashboardMemosPreview, DashboardRequestSummary | Local (EmployeePortalProvider state) | EmployeeAttendanceEntry, EmployeeRequestRecord, EmployeeMemo | FR-EMP-001 |
| /portal/profile | ROLE_EMPLOYEE | EmployeeProfile | Local (component state baseline) | User profile view model | FR-EMP-002 |
| /portal/attendance | ROLE_EMPLOYEE | EmployeeAttendance, AttendanceStatsCards, AttendanceEntriesTable, AttendanceEditRequestDialog | Local (EmployeePortalProvider submitAttendanceEditRequest) | EmployeeAttendanceEntry, EmployeeRequestRecord | FR-EMP-003 |
| /portal/requests | ROLE_EMPLOYEE | EmployeeRequests, RequestTypeMenu, RequestFiltersBar, RequestStatsCards, RequestListPanel, RequestFilingDialog | Local (EmployeePortalProvider submitRequest) | EmployeeRequestRecord | FR-EMP-004 |
| /portal/memos | ROLE_EMPLOYEE | EmployeeMemos, EmployeeMemoFilters, MemoDetailDialog | Local (EmployeePortalProvider memo state) | EmployeeMemo | FR-EMP-005 |
| /portal/evaluations | ROLE_EMPLOYEE | EmployeeEvaluations | Local (evaluation view models) | Evaluation view model | FR-EMP-006 |
| /admin/dashboard | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminDashboard | GET /api/admin/dashboard/metrics | User, RequestRecord, Shift, Memo | FR-ADM-001 |
| /admin/employees | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminEmployees, EmployeeList, EmployeeDetail, EmployeeWizard | GET /api/admin/employees, GET /api/admin/employees/:employeeId, POST /api/admin/employees, PATCH /api/admin/employees/:employeeId, PATCH /api/admin/employees/:employeeId/deactivate | User, School, Department | FR-ADM-002, FR-ADM-003, FR-ADM-004, FR-ADM-005 |
| /admin/organization | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminOrganization (DnD org board) | Local (organization mock/state baseline) | User, Department, School (frontend org models) | FR-ADM-012 |
| /admin/requests | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminRequests, RequestSearch, RequestDataTable, RequestMassActions | GET /api/admin/requests, GET /api/admin/requests/:requestId, PATCH /api/admin/requests/:requestId/status, PATCH /api/admin/requests/bulk-status | RequestRecord, User, School, Department | FR-ADM-006, FR-ADM-007, FR-ADM-008, FR-ADM-009 |
| /admin/shifts | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminShifts, WeekNavigator, ShiftAssignmentTable, AssignShiftDialog | Local (shift planning state baseline) | Shift assignment view model, User | FR-ADM-010 |
| /admin/reports | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | Navigate redirect to attendance report | None (redirect only) | None | FR-RBAC-001 |
| /admin/reports/attendance | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminAttendanceReport, EmployeeListPanel, DtrTable, GraphsPanel, EditAttendanceDialog, AddTimeDialog, DateFilterDialog, ExportDialog | Local (attendance report state baseline) | Attendance report row model, User | FR-ADM-012 |
| /admin/reports/tardiness | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminTardinessReport, TardinessFilters, TardinessLegend, TardinessTable | Local (tardiness report state baseline) | Tardiness report row model, User | FR-ADM-012 |
| /admin/reports/evaluations | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | FacultyEvaluationReportPage, FacultyListPanel, FacultyEvaluationSubjectTable, FacultyEvaluationDetailPanel | Local (evaluation report state baseline) | Evaluation report entities, User, Department | FR-ADM-012 |
| /admin/reports/requests | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | Navigate redirect to leave report | None (redirect only) | None | FR-RBAC-001 |
| /admin/reports/requests/leave | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | LeaveReportPage, ScopeFilterDialog, AddLeaveDialog | Local (request-report mock data baseline) | Request report row (Leave), User | FR-ADM-012 |
| /admin/reports/requests/expense | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | ExpenseReportPage, ScopeFilterDialog | Local (request-report mock data baseline) | Request report row (Expense), User | FR-ADM-012 |
| /admin/reports/requests/fund | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | FundRequestReportPage, ScopeFilterDialog, FundBreakdownDialog, AddFundPaymentDialog, AddFundRequestDialog | Local (request-report mock data baseline) | Request report row (Fund), User | FR-ADM-012 |
| /admin/reports/requests/overtime | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | OvertimeReportPage, ScopeFilterDialog, AddOvertimeDialog | Local (request-report mock data baseline) | Request report row (Overtime), User | FR-ADM-012 |
| /admin/reports/requests/undertime | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | UndertimeReportPage, ScopeFilterDialog, AddUndertimeDialog | Local (request-report mock data baseline) | Request report row (Undertime), User | FR-ADM-012 |
| /admin/reports/requests/wfh | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | WorkFromHomeReportPage, ScopeFilterDialog | Local (request-report mock data baseline) | Request report row (WFH), User | FR-ADM-012 |
| /admin/reports/requests/time-adjustment | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | TimeAdjustmentReportPage, ScopeFilterDialog | Local (request-report mock data baseline) | Request report row (Time Adjustment), User | FR-ADM-012 |
| /admin/reports/requests/shift-assignment | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | ShiftAssignmentReportPage, ScopeFilterDialog | Local (request-report mock data baseline) | Request report row (Shift Assignment), User | FR-ADM-012 |
| /admin/reports/requests/swap-request | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | GenericRequestReportPage (Swap Request mode), ScopeFilterDialog | Local (request-report mock data baseline) | Request report row (Swap Request), User | FR-ADM-012 |
| /admin/memo | ROLE_HEAD_ADMIN, ROLE_SCHOOL_ADMIN, ROLE_DEPARTMENT_ADMIN | AdminMemo, MemoFilters, MemoDetailDialog, MemoCreateDialog | Local (memo management state baseline) | Memo | FR-ADM-011 |
| / | Conditional redirect by authenticated role | Navigate | GET /api/auth/me (session bootstrap path), POST /api/auth/refresh (fallback path) | User, RefreshToken | FR-AUTH-002, FR-RBAC-001 |
| * | Fallback redirect | Navigate to / | None (routing fallback only) | None | FR-RBAC-001 |

---

## 8. Verification Guidance

Recommended test levels:
1. Unit tests
- Auth context state transitions.
- Scope filter utility logic.
- Request/employee query validation behavior.

2. Integration tests
- Auth login/refresh/logout API flow.
- Admin employee and request API CRUD/update flows with role/scope scenarios.

3. End-to-end tests
- Role-based route protection.
- Employee request filing workflows.
- Admin dashboard and request moderation workflows.

---

## 9. Known Baseline Limits

1. Several frontend modules still use local/mock state and are not yet fully connected to backend persistence.
2. The traceability matrix explicitly marks such routes as `Local` in the API column.
3. This SRS is implementation-aligned and should be revised when local modules are migrated to backend APIs.

---

End of document.
