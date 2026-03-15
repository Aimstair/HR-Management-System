export type NavLevel = 'campus' | 'department' | 'school' | 'employee' | 'profile';

export interface NavState {
  level: NavLevel;
  campus: string | null;
  department: string | null;
  school: string | null;
  employeeId: string | null;
}

export type ActiveState = 'Active' | 'Inactive';

export interface EmployeeNode {
  id: string;
  fullName: string;
  jobTitle: string;
  role: 'Faculty' | 'Staff' | 'Chairman' | 'Dean' | 'HR Admin';
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Retired';
  avatarUrl?: string;
  dateOfBirth: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  leaveCredits: Array<{
    id: string;
    type: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }>;
  studyLoads: Array<{
    id: string;
    subject: string;
    units: number;
    schedule: string;
  }>;
}

export interface SchoolNode {
  id: string;
  picture: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  status: ActiveState;
  employees: EmployeeNode[];
}

export interface DepartmentNode {
  id: string;
  picture: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  status: ActiveState;
  schools?: SchoolNode[];
  employees?: EmployeeNode[];
}

export interface CampusNode {
  id: string;
  picture: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  status: ActiveState;
  departments: DepartmentNode[];
}
