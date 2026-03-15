# HR Management System - Architecture Overview

## 🏗️ Project Structure

This is a comprehensive HR Management System built with **React + Vite + TypeScript**, designed for schools to manage employees, requests, shifts, and evaluations.

### Directory Structure

```
/vercel/share/v0-project/
├── src/
│   ├── App.tsx                          # Main app with routing
│   ├── main.tsx                         # Vite entry point
│   ├── index.css                        # Global Tailwind styles
│   │
│   ├── types/
│   │   └── index.ts                     # Comprehensive TypeScript interfaces
│   │
│   ├── context/
│   │   └── AuthContext.tsx              # Global auth state management
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx               # Main layout wrapper
│   │   │   ├── Sidebar.tsx              # Navigation sidebar (role-aware)
│   │   │   └── Header.tsx               # Top header bar
│   │   └── ui/                          # shadcn/ui components (provided)
│   │
│   ├── lib/
│   │   └── utils.ts                     # Utility functions (cn helper)
│   │
│   └── pages/
│       ├── auth/
│       │   └── LoginPage.tsx            # Authentication page
│       ├── employee/
│       │   ├── EmployeeDashboard.tsx   # Employee dashboard
│       │   ├── EmployeeProfile.tsx     # Profile view
│       │   ├── EmployeeAttendance.tsx  # Attendance records
│       │   ├── EmployeeRequests.tsx    # Request management
│       │   └── EmployeeEvaluations.tsx # Student evaluations
│       └── admin/
│           ├── AdminDashboard.tsx      # Admin dashboard
│           ├── AdminEmployees.tsx      # Employee management
│           ├── AdminOrganization.tsx   # Org structure
│           ├── AdminRequests.tsx       # Request processing
│           ├── AdminShifts.tsx         # Shift management
│           └── AdminReports.tsx        # Analytics & reports
│
├── index.html                           # Vite HTML entry
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript config
├── tailwind.config.ts                   # Tailwind CSS config
├── postcss.config.js                    # PostCSS config
├── package.json                         # Dependencies
└── ARCHITECTURE.md                      # This file
```

---

## 🔐 Authentication & Authorization

### AuthContext (`src/context/AuthContext.tsx`)

- **Provider Pattern**: Wraps entire app for global state
- **Mock Data**: Includes test credentials:
  - Employee: `employee@school.com` / `password` → `ROLE_EMPLOYEE`
  - HR Admin: `hr@school.com` / `password` → `ROLE_HR`
- **Local Storage**: Persists user session
- **useAuth Hook**: Custom hook to access auth context anywhere

### Protected Routes

All routes are wrapped with `ProtectedRoute` component that:
- Checks authentication status
- Validates user role matches route requirements
- Redirects to login if unauthorized

---

## 🗂️ Routing Architecture

### Route Structure

```
/login                          # Public auth page

/portal/*                       # ROLE_EMPLOYEE routes
├── /dashboard                  # Dashboard with quick widgets
├── /profile                    # Personal profile (read-only)
├── /attendance                 # Daily attendance records
├── /requests                   # Request submissions & status
└── /evaluations                # Student evaluation scores

/admin/*                        # ROLE_HR routes
├── /dashboard                  # System metrics & overview
├── /employees                  # Employee management grid
├── /organization               # Org structure visualization
├── /requests                   # Unified request inbox
├── /shifts                     # Shift assignment calendar
└── /reports                    # Analytics dashboards
```

### Layout Pattern

All authenticated routes use a **consistent layout**:
- **Sidebar**: Role-aware navigation
- **Header**: Page title + search + notifications
- **Main**: Dynamic content area (Outlet)

---

## 📊 Type System

### Core Types (`src/types/index.ts`)

#### User & Auth
- `UserRole` - Enum: `EMPLOYEE` | `HR`
- `User` - User entity with profile data
- `AuthContextType` - Auth context shape

#### Requests (8 Types)
- `LeaveRequest` - Time off requests
- `ExpenseRequest` - Expense reimbursement
- `WFHRequest` - Work from home
- `FundsRequest` - Fund allocation
- `UndertimeRequest` - Under-time logs
- `OvertimeRequest` - Overtime logs
- `AttendanceAdjustmentRequest` - Attendance corrections
- `ShiftSwapRequest` - Shift exchanges

#### Attendance & Shifts
- `AttendanceRecord` - Daily clock in/out
- `Shift` - Shift template (e.g., 9AM-5PM)
- `EmployeeShift` - Assignment of shift to employee

#### Organization
- `SchoolBranch` - Top-level org unit
- `Department` - Within branch
- `Team` - Within department
- `User` - Team members

#### Analytics
- `DashboardMetrics` - System-wide KPIs
- `EmployeeDashboardData` - Personal metrics
- `AnalyticsData` - Trends & reports

---

## 🎨 UI Components

### Used Libraries
- **shadcn/ui**: Pre-built, customizable components
- **Tailwind CSS**: Utility-first styling
- **lucide-react**: Icon library
- **recharts**: Analytics charts
- **react-hook-form** + **zod**: Form validation

### Component Hierarchy

```
Layout (Sidebar + Header)
├── Sidebar
│   ├── Navigation items (role-based)
│   ├── User profile card
│   └── Logout button
│
├── Header
│   ├── Page title (dynamic)
│   ├── Search bar
│   └── Notifications
│
└── Main Content (Outlet)
    └── Page-specific content
```

---

## 🔄 Data Flow

### State Management

1. **Global Auth State**
   - Stored in `AuthContext`
   - Persisted in localStorage
   - Accessed via `useAuth()` hook

2. **Page-level State** (To be implemented)
   - Local component state with `useState`
   - Data fetching with SWR (when API ready)
   - Form state with `react-hook-form`

3. **Mock Data**
   - Currently using hardcoded arrays
   - Will be replaced with API calls

---

## 🚀 Getting Started

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```
Vite will start on `http://localhost:3000`

### Build for Production
```bash
pnpm build
```

### Test Login
1. Navigate to login page
2. Use demo credentials:
   - **Employee**: `employee@school.com`
   - **HR Admin**: `hr@school.com`
3. Select role and click "Sign In" or use quick buttons

---

## 📋 Next Steps (Feature Roadmap)

### Phase 1: Core Pages
- [ ] Implement Employee Dashboard with widgets
- [ ] Implement Employee Profile view
- [ ] Implement Attendance table
- [ ] Implement Request form (8 types) + status table
- [ ] Implement Evaluations view

### Phase 2: Admin Features
- [ ] Implement Admin Dashboard metrics
- [ ] Implement Employees searchable grid
- [ ] Implement Organization matrix
- [ ] Implement Request processing (Kanban/Grid)
- [ ] Implement Shift calendar

### Phase 3: Analytics
- [ ] Implement Reports dashboard
- [ ] Add Attendance analytics
- [ ] Add Request trends
- [ ] Add Evaluation rankings

### Phase 4: Backend Integration
- [ ] Connect to backend API
- [ ] Replace mock data with real data
- [ ] Implement data persistence
- [ ] Add real authentication

---

## 🛠️ Design Decisions

### Why Vite?
- Fast dev server with HMR
- Smaller bundle size
- Modern ESM-first approach
- Better TypeScript support

### Why react-router-dom v6?
- Industry standard routing
- Nested routes for layout hierarchy
- Built-in loaders & actions
- Excellent TypeScript support

### Why Context API?
- Simple global auth state
- No external dependencies
- Perfect for auth + theme
- Can be upgraded to Redux/Zustand later

### Why shadcn/ui?
- Copy-paste component library
- Full control over styling
- Radix UI accessible primitives
- Tailwind CSS integration

---

## 📝 Code Style

### TypeScript Strictness
- `strict: true` in tsconfig
- NO `any` types allowed
- All interfaces fully typed
- Type-safe component props

### Component Guidelines
- Functional components only
- React hooks for state/effects
- Separate concerns into small files
- Props well-documented

### Naming Conventions
- Components: PascalCase (`LoginPage`, `Sidebar`)
- Files: PascalCase for components, camelCase for utilities
- Types: PascalCase with suffix (`UserRole`, `AuthContextType`)
- Constants: UPPER_SNAKE_CASE

---

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main routing configuration |
| `src/types/index.ts` | Type definitions |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/components/layout/Layout.tsx` | Layout wrapper |
| `src/pages/*` | Page components |
| `index.html` | Vite entry point |
| `vite.config.ts` | Build configuration |

---

**Last Updated**: 2026-03-13
**Status**: ✅ Core Architecture Complete - Ready for Feature Development
