import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import ViewHeader from './components/ViewHeader';
import CampusGrid from './components/CampusGrid';
import DepartmentGrid from './components/DepartmentGrid';
import SchoolGrid from './components/SchoolGrid';
import OrganizationTree from './components/OrganizationTree';
import EmployeeGrid from './components/EmployeeGrid';
import EmployeeDetail from './profile/EmployeeDetail';
import OnboardingWizard from './profile/OnboardingWizard';
import { campuses as initialCampuses } from './mockData';
import type { CampusNode, EmployeeNode, NavState, DepartmentNode, SchoolNode } from './types';

const AdminEmployeesPage: React.FC = () => {
  const [campuses, setCampuses] = useState<CampusNode[]>(initialCampuses);
  const [navState, setNavState] = useState<NavState>({
    level: 'campus',
    campus: null,
    department: null,
    school: null,
    employeeId: null,
  });

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === navState.campus) ?? null,
    [campuses, navState.campus],
  );

  const selectedDepartment = useMemo(
    () => selectedCampus?.departments.find((department) => department.id === navState.department) ?? null,
    [selectedCampus, navState.department],
  );

  const selectedSchool = useMemo(
    () => selectedDepartment?.schools?.find((school) => school.id === navState.school) ?? null,
    [navState.school, selectedDepartment],
  );

  const employeesForCurrentScope = useMemo(() => {
    if (selectedSchool) {
      return selectedSchool.employees;
    }

    return selectedDepartment?.employees ?? [];
  }, [selectedDepartment, selectedSchool]);

  const selectedEmployee = useMemo(
    () => employeesForCurrentScope.find((employee) => employee.id === navState.employeeId) ?? null,
    [employeesForCurrentScope, navState.employeeId],
  );

  const schoolOptionsForSelectedDepartment = selectedDepartment?.schools ?? [];

  const resetFilters = (): void => {
    setSearch('');
    setStatusFilter('all');
  };

  const jumpToLevel = (level: NavState['level']): void => {
    if (level === 'campus') {
      setNavState({ level: 'campus', campus: null, department: null, school: null, employeeId: null });
      resetFilters();
      return;
    }

    if (level === 'department') {
      setNavState((current) => ({
        level: 'department',
        campus: current.campus,
        department: null,
        school: null,
        employeeId: null,
      }));
      resetFilters();
      return;
    }

    if (level === 'school') {
      setNavState((current) => ({
        level: 'school',
        campus: current.campus,
        department: current.department,
        school: null,
        employeeId: null,
      }));
      resetFilters();
      return;
    }

    if (level === 'employee') {
      setNavState((current) => ({
        level: 'employee',
        campus: current.campus,
        department: current.department,
        school: current.school,
        employeeId: null,
      }));
      resetFilters();
      return;
    }
  };

  const handleSelectCampus = (campus: CampusNode): void => {
    setNavState({
      level: 'department',
      campus: campus.id,
      department: null,
      school: null,
      employeeId: null,
    });
    resetFilters();
  };

  const handleSelectDepartment = (
    department: DepartmentNode,
    targetLevel: 'school' | 'employee',
  ): void => {
    setNavState((current) => ({
      level: targetLevel,
      campus: current.campus,
      department: department.id,
      school: null,
      employeeId: null,
    }));
    resetFilters();
  };

  const handleSelectSchool = (school: SchoolNode): void => {
    setNavState((current) => ({
      level: 'employee',
      campus: current.campus,
      department: current.department,
      school: school.id,
      employeeId: null,
    }));
    resetFilters();
  };

  const handleSelectEmployee = (employeeId: string): void => {
    setNavState((current) => ({
      ...current,
      level: 'profile',
      employeeId,
    }));
  };

  const handleSaveEmployee = (updated: EmployeeNode): void => {
    setCampuses((current) =>
      current.map((campus) => ({
        ...campus,
        departments: campus.departments.map((department) => {
          if (department.id !== navState.department) {
            return department;
          }

          if (navState.school && department.schools) {
            return {
              ...department,
              schools: department.schools.map((school) =>
                school.id === navState.school
                  ? {
                      ...school,
                      employees: school.employees.map((employee) =>
                        employee.id === updated.id ? updated : employee,
                      ),
                    }
                  : school,
              ),
            };
          }

          return {
            ...department,
            employees: (department.employees ?? []).map((employee) =>
              employee.id === updated.id ? updated : employee,
            ),
          };
        }),
      })),
    );
  };

  const handleWizardCreate = (
    employee: EmployeeNode,
    campusId: string,
    departmentId: string,
    schoolId: string | null,
  ): void => {
    setCampuses((current) =>
      current.map((campus) => {
        if (campus.id !== campusId) {
          return campus;
        }

        return {
          ...campus,
          departments: campus.departments.map((department) => {
            if (department.id !== departmentId) {
              return department;
            }

            if (schoolId && department.schools) {
              return {
                ...department,
                schools: department.schools.map((school) =>
                  school.id === schoolId
                    ? { ...school, employees: [employee, ...school.employees] }
                    : school,
                ),
              };
            }

            return {
              ...department,
              employees: [employee, ...(department.employees ?? [])],
            };
          }),
        };
      }),
    );

    setNavState({
      level: 'employee',
      campus: campusId,
      department: departmentId,
      school: schoolId,
      employeeId: null,
    });
  };

  const breadcrumbName = {
    campus: selectedCampus?.name,
    department: selectedDepartment?.name,
    school: selectedSchool?.name,
    employee: selectedEmployee?.fullName,
  };

  return (
    <div className="space-y-4">

      <Breadcrumb className='border p-2 pl-4 rounded-sm'>
        <BreadcrumbList>
          <BreadcrumbItem>
            {navState.level === 'campus' ? (
              <BreadcrumbPage>Home</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <button type="button" className='cursor-pointer hover:underline' onClick={() => jumpToLevel('campus')}>Home</button>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {breadcrumbName.campus ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {navState.level === 'department' ? (
                  <BreadcrumbPage>{breadcrumbName.campus}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button type="button" className='cursor-pointer hover:underline' onClick={() => jumpToLevel('department')}>
                      {breadcrumbName.campus}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          ) : null}

          {breadcrumbName.department ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {navState.level === 'school' || (navState.level === 'employee' && !navState.school) ? (
                  <BreadcrumbPage>{breadcrumbName.department}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      className='cursor-pointer hover:underline'
                      onClick={() => jumpToLevel(breadcrumbName.department === 'Teaching Faculties' ? 'school' : 'employee')}
                    >
                      {breadcrumbName.department}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          ) : null}

          {breadcrumbName.school ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {navState.level === 'employee' ? (
                  <BreadcrumbPage>{breadcrumbName.school}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button type="button" className='cursor-pointer hover:underline' onClick={() => jumpToLevel('employee')}>
                      {breadcrumbName.school}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          ) : null}

          {breadcrumbName.employee && navState.level === 'profile' ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbName.employee}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      {navState.level === 'campus' ? (
        <>
          <ViewHeader
            title="Campuses"
            searchValue={search}
            statusFilter={statusFilter}
            viewMode={viewMode}
            showViewToggle={false}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => setIsWizardOpen(true)}
          />
          <CampusGrid
            campuses={campuses}
            search={search}
            statusFilter={statusFilter}
            onSelectCampus={handleSelectCampus}
            onToggleStatus={(campusId) => {
              setCampuses((current) =>
                current.map((campus) =>
                  campus.id === campusId
                    ? { ...campus, status: campus.status === 'Active' ? 'Inactive' : 'Active' }
                    : campus,
                ),
              );
              toast.success('Campus status updated.');
            }}
            onEditCampus={() => toast.success('Campus edit placeholder opened.')}
          />
        </>
      ) : null}

      {navState.level === 'department' && selectedCampus ? (
        <>
          <ViewHeader
            title={`Departments - ${selectedCampus.name}`}
            searchValue={search}
            statusFilter={statusFilter}
            viewMode={viewMode}
            showViewToggle={false}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => setIsWizardOpen(true)}
          />
          <DepartmentGrid
            campus={selectedCampus}
            search={search}
            statusFilter={statusFilter}
            onSelectDepartment={handleSelectDepartment}
          />
        </>
      ) : null}

      {navState.level === 'school' && selectedCampus && selectedDepartment ? (
        <>
          <ViewHeader
            title={`Schools - ${selectedCampus.name}`}
            searchValue={search}
            statusFilter={statusFilter}
            viewMode={viewMode}
            showViewToggle={false}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => setIsWizardOpen(true)}
          />
          <SchoolGrid
            campus={selectedCampus}
            schools={schoolOptionsForSelectedDepartment}
            search={search}
            statusFilter={statusFilter}
            onSelectSchool={handleSelectSchool}
          />
        </>
      ) : null}

      {navState.level === 'employee' ? (
        <>
          <ViewHeader
            title="Employees"
            searchValue={search}
            statusFilter={statusFilter}
            viewMode={viewMode}
            showViewToggle={true}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => setIsWizardOpen(true)}
          />
          {viewMode === 'grid' ? (
            <EmployeeGrid
              employees={employeesForCurrentScope}
              search={search}
              statusFilter={statusFilter}
              onSelectEmployee={handleSelectEmployee}
            />
          ) : (
            <OrganizationTree
              level="employee"
              campus={selectedCampus!}
              departments={[]}
              schools={[]}
              employees={employeesForCurrentScope}
              departmentName={selectedDepartment?.name}
              schoolName={selectedSchool?.name}
              onSelectDepartment={handleSelectDepartment}
              onSelectSchool={handleSelectSchool}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
        </>
      ) : null}

      {navState.level === 'profile' && selectedEmployee ? (
        <EmployeeDetail
          employee={selectedEmployee}
          inSchoolContext={Boolean(navState.school)}
          onBack={() => jumpToLevel('employee')}
          onSaveEmployee={handleSaveEmployee}
        />
      ) : null}

      <OnboardingWizard
        open={isWizardOpen}
        campuses={campuses}
        onOpenChange={setIsWizardOpen}
        onCreated={handleWizardCreate}
      />
    </div>
  );
};

export default AdminEmployeesPage;
