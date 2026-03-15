import type { CampusNode, DepartmentNode, EmployeeNode, SchoolNode } from './types';

const makeEmployee = (
  id: string,
  fullName: string,
  jobTitle: string,
  role: EmployeeNode['role'],
  status: EmployeeNode['status'],
): EmployeeNode => ({
  id,
  fullName,
  jobTitle,
  role,
  email: `${fullName.toLowerCase().replace(/[^a-z]+/g, '.').replace(/(^\.|\.$)/g, '')}@school.edu`,
  phone: '+63 917 555 0000',
  status,
  dateOfBirth: '1990-01-01',
  address: 'Metro Manila',
  bankName: 'BPI',
  accountName: fullName,
  accountNumber: '1234-5678-9012',
  leaveCredits: [
    { id: `${id}-L1`, type: 'Vacation Leave', date: '2026-03-02', status: 'Approved' },
    { id: `${id}-L2`, type: 'Sick Leave', date: '2026-03-10', status: 'Pending' },
  ],
  studyLoads:
    role === 'Faculty' || role === 'Chairman' || role === 'Dean'
      ? [
          { id: `${id}-S1`, subject: 'Professional Subject 1', units: 3, schedule: 'MWF 10:00-11:00' },
          { id: `${id}-S2`, subject: 'Professional Subject 2', units: 3, schedule: 'TTH 13:00-14:30' },
        ]
      : [],
});

const schoolEngineering: SchoolNode = {
  id: 'SCH-ENG',
  picture: 'https://picsum.photos/seed/school-eng/500/300',
  name: 'School of Engineering',
  location: 'Main Campus',
  contact: '+63 2 7000 1001',
  email: 'engineering@school.edu',
  status: 'Active',
  employees: [
    makeEmployee('EMP-1001', 'Dr. Amelia Smith', 'Dean of Engineering', 'Dean', 'Active'),
    makeEmployee('EMP-1002', 'Engr. Marco Doe', 'Chairman, Computer Engineering', 'Chairman', 'Active'),
    makeEmployee('EMP-1003', 'Prof. Nina Castro', 'Professor of Computer Engineering', 'Faculty', 'Active'),
  ],
};

const schoolArts: SchoolNode = {
  id: 'SCH-ARTS',
  picture: 'https://picsum.photos/seed/school-arts/500/300',
  name: 'School of Arts & Sciences',
  location: 'Main Campus',
  contact: '+63 2 7000 1002',
  email: 'arts.sciences@school.edu',
  status: 'Active',
  employees: [
    makeEmployee('EMP-1004', 'Dr. Victor Santos', 'Dean of Arts & Sciences', 'Dean', 'Active'),
    makeEmployee('EMP-1005', 'Prof. Liza Ramos', 'Professor of Biology', 'Faculty', 'On Leave'),
  ],
};

const schoolLaw: SchoolNode = {
  id: 'SCH-LAW',
  picture: 'https://picsum.photos/seed/school-law/500/300',
  name: 'School of Law',
  location: 'Quadricentennial Campus',
  contact: '+63 2 7000 2001',
  email: 'law@school.edu',
  status: 'Active',
  employees: [
    makeEmployee('EMP-1006', 'Atty. Noel Fernandez', 'Dean of Law', 'Dean', 'Active'),
    makeEmployee('EMP-1007', 'Atty. Grace Mateo', 'Professor of Constitutional Law', 'Faculty', 'Active'),
  ],
};

const schoolCS: SchoolNode = {
  id: 'SCH-CS',
  picture: 'https://picsum.photos/seed/school-cs/500/300',
  name: 'School of Computer Studies',
  location: 'Quadricentennial Campus',
  contact: '+63 2 7000 2002',
  email: 'computer.studies@school.edu',
  status: 'Active',
  employees: [
    makeEmployee('EMP-1008', 'Dr. Elena Torres', 'Dean of Computer Studies', 'Dean', 'Active'),
    makeEmployee('EMP-1009', 'Prof. Arman Teo', 'Professor of Computer Science', 'Faculty', 'Retired'),
  ],
};

const baseDepartments = (): DepartmentNode[] => [
  {
    id: 'DEP-HR',
    picture: 'https://picsum.photos/seed/dep-hr/500/300',
    name: 'HR',
    location: 'Admin Building',
    contact: '+63 2 7000 3001',
    email: 'hr@school.edu',
    status: 'Active',
    employees: [
      makeEmployee('EMP-2001', 'Irene Velasco', 'HR Administrator', 'HR Admin', 'Active'),
      makeEmployee('EMP-2002', 'Paul Mercado', 'HR Officer', 'Staff', 'Active'),
    ],
  },
  {
    id: 'DEP-ACC',
    picture: 'https://picsum.photos/seed/dep-accounting/500/300',
    name: 'Accounting',
    location: 'Finance Building',
    contact: '+63 2 7000 3002',
    email: 'accounting@school.edu',
    status: 'Active',
    employees: [
      makeEmployee('EMP-2003', 'Joel Santos', 'Payroll Specialist', 'Staff', 'Active'),
      makeEmployee('EMP-2004', 'Kyla Diaz', 'Accounting Analyst', 'Staff', 'On Leave'),
    ],
  },
  {
    id: 'DEP-MNT',
    picture: 'https://picsum.photos/seed/dep-maintenance/500/300',
    name: 'Maintenance',
    location: 'Facilities Office',
    contact: '+63 2 7000 3003',
    email: 'maintenance@school.edu',
    status: 'Active',
    employees: [
      makeEmployee('EMP-2005', 'Leo Navarro', 'Maintenance Technician', 'Staff', 'Active'),
    ],
  },
  {
    id: 'DEP-CLN',
    picture: 'https://picsum.photos/seed/dep-cleaners/500/300',
    name: 'Cleaners',
    location: 'Facilities Office',
    contact: '+63 2 7000 3004',
    email: 'cleaners@school.edu',
    status: 'Active',
    employees: [
      makeEmployee('EMP-2006', 'Maria Cruz', 'Senior Cleaner', 'Staff', 'Active'),
    ],
  },
  {
    id: 'DEP-GUI',
    picture: 'https://picsum.photos/seed/dep-guidance/500/300',
    name: 'Guidance',
    location: 'Student Affairs Office',
    contact: '+63 2 7000 3005',
    email: 'guidance@school.edu',
    status: 'Inactive',
    employees: [
      makeEmployee('EMP-2007', 'Anne Villanueva', 'Guidance Counselor', 'Staff', 'Active'),
    ],
  },
  {
    id: 'DEP-DIS',
    picture: 'https://picsum.photos/seed/dep-disciplinary/500/300',
    name: 'Disciplinary',
    location: 'Student Affairs Office',
    contact: '+63 2 7000 3006',
    email: 'disciplinary@school.edu',
    status: 'Active',
    employees: [
      makeEmployee('EMP-2008', 'Rico Navarro', 'Discipline Officer', 'Staff', 'Retired'),
    ],
  },
];

export const campuses: CampusNode[] = [
  {
    id: 'CMP-BASAK',
    picture: 'https://picsum.photos/seed/campus-basak/800/480',
    name: 'Basak Campus',
    address: 'Basak, Cebu City',
    contact: '+63 32 123 1000',
    email: 'basak@school.edu',
    status: 'Active',
    departments: [
      ...baseDepartments(),
      {
        id: 'DEP-TEACH-BASAK',
        picture: 'https://picsum.photos/seed/dep-teach-basak/500/300',
        name: 'Teaching Faculties',
        location: 'Academic Center',
        contact: '+63 32 123 2001',
        email: 'teaching.basak@school.edu',
        status: 'Active',
        schools: [schoolEngineering],
      },
    ],
  },
  {
    id: 'CMP-MAIN',
    picture: 'https://picsum.photos/seed/campus-main/800/480',
    name: 'Main Campus',
    address: 'Taft Avenue, Manila',
    contact: '+63 2 8123 1000',
    email: 'main@school.edu',
    status: 'Active',
    departments: [
      ...baseDepartments(),
      {
        id: 'DEP-TEACH-MAIN',
        picture: 'https://picsum.photos/seed/dep-teach-main/500/300',
        name: 'Teaching Faculties',
        location: 'Academic Center',
        contact: '+63 2 8123 2001',
        email: 'teaching.main@school.edu',
        status: 'Active',
        schools: [schoolEngineering, schoolArts],
      },
    ],
  },
  {
    id: 'CMP-QUAD',
    picture: 'https://picsum.photos/seed/campus-quad/800/480',
    name: 'Quadricentennial Campus',
    address: 'Novaliches, Quezon City',
    contact: '+63 2 8999 1000',
    email: 'quadricentennial@school.edu',
    status: 'Inactive',
    departments: [
      ...baseDepartments(),
      {
        id: 'DEP-TEACH-QUAD',
        picture: 'https://picsum.photos/seed/dep-teach-quad/500/300',
        name: 'Teaching Faculties',
        location: 'Academic Center',
        contact: '+63 2 8999 2001',
        email: 'teaching.quad@school.edu',
        status: 'Active',
        schools: [schoolLaw, schoolCS],
      },
    ],
  },
];
