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
  firstName: string;
  lastName: string;
  email: string;
  employeeType: 'TEACHING' | 'NON_TEACHING';
  isActive: boolean;
  status: ActiveState;
  position: string | null;
  profileImage: string | null;
  schoolId: string | null;
  schoolBranch: string | null;
  departmentId: string | null;
  department: string | null;
  joinDate: string;
  idNumber?: string | null;
  sssId?: string | null;
  pagIbigId?: string | null;
  tinNo?: string | null;
  philhealthNo?: string | null;
}

export interface SchoolNode {
  id: string;
  picture: string | null;
  name: string;
  location: string | null;
  contact: string | null;
  email: string | null;
  status: ActiveState;
  departments?: DepartmentNode[];
}

export interface DepartmentNode {
  id: string;
  picture: string | null;
  name: string;
  location: string | null;
  contact: string | null;
  email: string | null;
  status: ActiveState;
  schools?: SchoolNode[];
}

export interface CampusNode {
  id: string;
  picture: string | null;
  name: string;
  address: string | null;
  contact: string | null;
  email: string | null;
  status: ActiveState;
  departments: DepartmentNode[];
}
