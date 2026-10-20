import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import ViewHeader from './components/ViewHeader';
import CampusGrid from './components/CampusGrid';
import DepartmentGrid from './components/DepartmentGrid';
import SchoolGrid from './components/SchoolGrid';
import OrganizationTree from './components/OrganizationTree';
import EmployeeGrid from './components/EmployeeGrid';
import EmployeeDetail from './profile/EmployeeDetail';
import OnboardingWizard from './profile/OnboardingWizard';
import { useAuth } from '../../../context/AuthContext';
import {
  createAdminCampus,
  createAdminDepartment,
  createAdminSchool,
  getAdminEmployeeById,
  getAdminEmployees,
  getAdminOrganizationCampuses,
  updateAdminCampus,
  type AdminEmployeeRecord,
  type AdminOrganizationCampus,
  type AdminOrganizationDepartment,
  type AdminOrganizationSchool,
} from '../../../lib/admin-api';
import { UserRole } from '../../../types';
import type { CampusNode, EmployeeNode, NavState, DepartmentNode, SchoolNode } from './types';

interface CampusFormValues {
  name: string;
  code: string;
  address: string;
  contact: string;
  email: string;
  status: 'Active' | 'Inactive';
  picture: string;
}

interface SchoolFormValues {
  name: string;
  location: string;
  contact: string;
  email: string;
  status: 'Active' | 'Inactive';
  picture: string;
}

interface DepartmentFormValues {
  name: string;
  location: string;
  contact: string;
  email: string;
  status: 'Active' | 'Inactive';
  picture: string;
}

const AdminEmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [campuses, setCampuses] = useState<CampusNode[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState<boolean>(false);
  const [isSchoolDialogOpen, setIsSchoolDialogOpen] = useState<boolean>(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState<boolean>(false);
  const [editingCampus, setEditingCampus] = useState<CampusNode | null>(null);
  const [employeeCache, setEmployeeCache] = useState<Record<string, EmployeeNode[]>>({});
  const [isEmployeeLoading, setIsEmployeeLoading] = useState<boolean>(false);

  const campusForm = useForm<CampusFormValues>({
    defaultValues: {
      name: '',
      code: '',
      address: '',
      contact: '',
      email: '',
      status: 'Active',
      picture: '',
    },
  });

  const schoolForm = useForm<SchoolFormValues>({
    defaultValues: {
      name: '',
      location: '',
      contact: '',
      email: '',
      status: 'Active',
      picture: '',
    },
  });

  const departmentForm = useForm<DepartmentFormValues>({
    defaultValues: {
      name: '',
      location: '',
      contact: '',
      email: '',
      status: 'Active',
      picture: '',
    },
  });

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
    const scopeKey = navState.school
      ? `school:${navState.school}`
      : navState.department
        ? `department:${navState.department}`
        : '';

    return scopeKey ? employeeCache[scopeKey] ?? [] : [];
  }, [employeeCache, navState.department, navState.school]);

  const selectedEmployee = useMemo(
    () => employeesForCurrentScope.find((employee) => employee.id === navState.employeeId) ?? null,
    [employeesForCurrentScope, navState.employeeId],
  );

  const canManageCampuses = user?.role === UserRole.HEAD_HR;
  const canManageSchools = user?.role === UserRole.HEAD_HR || user?.role === UserRole.CAMPUS_HR;
  const canManageDepartments = user?.role === UserRole.HEAD_HR || user?.role === UserRole.CAMPUS_HR;

  const buildEmployeeNode = (employee: AdminEmployeeRecord): EmployeeNode => {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      employeeType: employee.employeeType,
      isActive: employee.isActive,
      status: employee.isActive ? 'Active' : 'Inactive',
      position: employee.position,
      profileImage: employee.profileImage,
      schoolId: employee.schoolId,
      schoolBranch: employee.schoolBranch,
      departmentId: employee.departmentId,
      department: employee.department,
      joinDate: employee.joinDate,
    };
  };

  const fetchOrganization = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAdminOrganizationCampuses();
      const mapped = response.campuses.map((campus: AdminOrganizationCampus): CampusNode => {
        const teachingDepartment: DepartmentNode = {
          id: `${campus.id}-TEACHING`,
          name: 'Teaching Faculties',
          location: campus.name,
          contact: campus.contact,
          email: campus.email,
          status: campus.status,
          picture: campus.picture,
          schools: campus.teachingSchools.map((school: AdminOrganizationSchool): SchoolNode => ({
            id: school.id,
            name: school.name,
            location: school.location,
            contact: school.contact,
            email: school.email,
            status: school.status,
            picture: school.picture,
            departments: (school.departments ?? []).map((department: AdminOrganizationDepartment): DepartmentNode => ({
              id: department.id,
              name: department.name,
              location: department.location,
              contact: department.contact,
              email: department.email,
              status: department.status,
              picture: department.picture,
            })),
          })),
        };

        const nonTeachingDepartments = campus.nonTeachingDepartments.map(
          (department: AdminOrganizationDepartment): DepartmentNode => ({
            id: department.id,
            name: department.name,
            location: department.location,
            contact: department.contact,
            email: department.email,
            status: department.status,
            picture: department.picture,
          }),
        );

        return {
          id: campus.id,
          name: campus.name,
          address: campus.address,
          contact: campus.contact,
          email: campus.email,
          status: campus.status,
          picture: campus.picture,
          departments: [teachingDepartment, ...nonTeachingDepartments],
        };
      });

      setCampuses(mapped);
      if (mapped.length > 0 && navState.campus === null && user?.role === UserRole.CAMPUS_HR) {
        setNavState((current) => ({
          ...current,
          level: 'department',
          campus: mapped[0].id,
          department: null,
          school: null,
          employeeId: null,
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load organization data.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async (scope: { campusId: string; departmentId?: string; teachingSchoolId?: string }): Promise<void> => {
    setIsEmployeeLoading(true);
    try {
      const response = await getAdminEmployees({
        schoolId: scope.campusId,
        departmentId: scope.departmentId,
        teachingSchoolId: scope.teachingSchoolId,
        limit: 200,
        page: 1,
      });

      const scopedEmployees = response.rows.map(buildEmployeeNode);
      const cacheKey = scope.teachingSchoolId
        ? `school:${scope.teachingSchoolId}`
        : scope.departmentId
          ? `department:${scope.departmentId}`
          : '';

      if (cacheKey) {
        setEmployeeCache((current) => ({
          ...current,
          [cacheKey]: scopedEmployees,
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load employees.');
    } finally {
      setIsEmployeeLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrganization();
  }, []);

  useEffect(() => {
    const employeeId = searchParams.get('employeeId');
    if (!employeeId) {
      return;
    }

    const loadById = async (): Promise<void> => {
      try {
        const response = await getAdminEmployeeById(employeeId);
        const employee = buildEmployeeNode(response.employee);

        const campus = campuses.find((item) => item.id === employee.schoolId);
        const department = campus?.departments.find((item) => item.id === employee.departmentId) ?? null;
        const teachingDepartment = campus?.departments.find((item) => item.name === 'Teaching Faculties') ?? null;
        const teachingSchool = teachingDepartment?.schools?.find((school) =>
          school.departments?.some((dept) => dept.id === employee.departmentId),
        ) ?? null;

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('employeeId');
        setSearchParams(nextParams, { replace: true });

        if (!campus) {
          return;
        }

        setEmployeeCache((current) => {
          const cacheKey = teachingSchool
            ? `school:${teachingSchool.id}`
            : department
              ? `department:${department.id}`
              : '';
          if (!cacheKey) {
            return current;
          }

          const existing = current[cacheKey] ?? [];
          return {
            ...current,
            [cacheKey]: existing.some((item) => item.id === employee.id)
              ? existing
              : [employee, ...existing],
          };
        });

        setNavState({
          level: 'profile',
          campus: campus.id,
          department: department?.id ?? teachingDepartment?.id ?? null,
          school: teachingSchool?.id ?? null,
          employeeId,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load employee profile.');
      }
    };

    void loadById();
  }, [campuses, searchParams, setSearchParams]);

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

    if (targetLevel === 'employee' && currentCampusId()) {
      void loadEmployees({ campusId: currentCampusId()!, departmentId: department.id });
    }
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

    if (currentCampusId()) {
      void loadEmployees({ campusId: currentCampusId()!, teachingSchoolId: school.id });
    }
  };

  const handleSelectEmployee = (employeeId: string): void => {
    setNavState((current) => ({
      ...current,
      level: 'profile',
      employeeId,
    }));
  };

  const handleSaveEmployee = (updated: EmployeeNode): void => {
    setEmployeeCache((current) => {
      const cacheKey = navState.school
        ? `school:${navState.school}`
        : navState.department
          ? `department:${navState.department}`
          : null;

      if (!cacheKey) {
        return current;
      }

      const currentEmployees = current[cacheKey] ?? [];
      return {
        ...current,
        [cacheKey]: currentEmployees.map((employee) =>
          employee.id === updated.id ? updated : employee,
        ),
      };
    });
  };

  const handleWizardCreate = (
    employee: EmployeeNode,
    scope: { campusId: string; departmentId: string | null; teachingSchoolId: string | null },
  ): void => {
    const cacheKey = scope.teachingSchoolId
      ? `school:${scope.teachingSchoolId}`
      : scope.departmentId
        ? `department:${scope.departmentId}`
        : null;

    if (cacheKey) {
      setEmployeeCache((current) => ({
        ...current,
        [cacheKey]: [employee, ...(current[cacheKey] ?? [])],
      }));
    }

    setNavState({
      level: 'employee',
      campus: scope.campusId,
      department: scope.departmentId,
      school: scope.teachingSchoolId,
      employeeId: null,
    });
  };

  const currentCampusId = (): string | null => navState.campus;

  const openCampusDialog = (campus?: CampusNode): void => {
    if (campus) {
      setEditingCampus(campus);
      campusForm.reset({
        name: campus.name,
        code: '',
        address: campus.address ?? '',
        contact: campus.contact ?? '',
        email: campus.email ?? '',
        status: campus.status,
        picture: campus.picture ?? '',
      });
    } else {
      setEditingCampus(null);
      campusForm.reset({
        name: '',
        code: '',
        address: '',
        contact: '',
        email: '',
        status: 'Active',
        picture: '',
      });
    }
    setIsCampusDialogOpen(true);
  };

  const openSchoolDialog = (): void => {
    schoolForm.reset({
      name: '',
      location: selectedCampus?.name ?? '',
      contact: selectedCampus?.contact ?? '',
      email: '',
      status: 'Active',
      picture: '',
    });
    setIsSchoolDialogOpen(true);
  };

  const openDepartmentDialog = (): void => {
    departmentForm.reset({
      name: '',
      location: selectedCampus?.name ?? '',
      contact: selectedCampus?.contact ?? '',
      email: '',
      status: 'Active',
      picture: '',
    });
    setIsDepartmentDialogOpen(true);
  };

  const saveCampus = async (values: CampusFormValues): Promise<void> => {
    try {
      if (editingCampus) {
        await updateAdminCampus(editingCampus.id, {
          name: values.name,
          address: values.address || null,
          contact: values.contact || null,
          email: values.email || null,
          status: values.status,
          picture: values.picture || null,
        });
        toast.success('Campus updated.');
      } else {
        await createAdminCampus({
          name: values.name,
          code: values.code || undefined,
          address: values.address || null,
          contact: values.contact || null,
          email: values.email || null,
          status: values.status,
          picture: values.picture || null,
        });
        toast.success('Campus created.');
      }

      setIsCampusDialogOpen(false);
      await fetchOrganization();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campus.');
    }
  };

  const saveSchool = async (values: SchoolFormValues): Promise<void> => {
    if (!selectedCampus) {
      toast.error('Select a campus first.');
      return;
    }

    try {
      await createAdminSchool({
        campusId: selectedCampus.id,
        name: values.name,
        location: values.location || null,
        contact: values.contact || null,
        email: values.email || null,
        status: values.status,
        picture: values.picture || null,
      });
      toast.success('Teaching school created.');
      setIsSchoolDialogOpen(false);
      await fetchOrganization();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create school.');
    }
  };

  const saveDepartment = async (values: DepartmentFormValues): Promise<void> => {
    if (!selectedCampus) {
      toast.error('Select a campus first.');
      return;
    }

    try {
      await createAdminDepartment({
        campusId: selectedCampus.id,
        name: values.name,
        location: values.location || null,
        contact: values.contact || null,
        email: values.email || null,
        status: values.status,
        picture: values.picture || null,
      });
      toast.success('Department created.');
      setIsDepartmentDialogOpen(false);
      await fetchOrganization();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create department.');
    }
  };

  const breadcrumbName = {
    campus: selectedCampus?.name,
    department: selectedDepartment?.name,
    school: selectedSchool?.name,
    employee: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : null,
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

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading organization data...</p>
      ) : null}

      {navState.level === 'campus' ? (
        <>
          <ViewHeader
            title="Campuses"
            searchValue={search}
            statusFilter={statusFilter}
            viewMode={viewMode}
            showViewToggle={false}
            canAdd={canManageCampuses}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => openCampusDialog()}
          />
          <CampusGrid
            campuses={campuses}
            search={search}
            statusFilter={statusFilter}
            onSelectCampus={handleSelectCampus}
            canManage={canManageCampuses}
            onToggleStatus={(campusId) => {
              const campus = campuses.find((item) => item.id === campusId);
              if (!campus) {
                return;
              }
              openCampusDialog(campus);
            }}
            onEditCampus={(campusId) => {
              const campus = campuses.find((item) => item.id === campusId);
              if (!campus) {
                return;
              }
              openCampusDialog(campus);
            }}
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
            canAdd={canManageDepartments}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => openDepartmentDialog()}
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
            canAdd={canManageSchools}
            onSearch={setSearch}
            onFilterStatus={setStatusFilter}
            onToggleView={setViewMode}
            onAddNew={() => openSchoolDialog()}
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
          {isEmployeeLoading ? (
            <p className="text-xs text-muted-foreground">Loading employees...</p>
          ) : null}
        </>
      ) : null}

      {navState.level === 'profile' && selectedEmployee ? (
        <EmployeeDetail
          employee={selectedEmployee}
          campuses={campuses}
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

      <Dialog open={isCampusDialogOpen} onOpenChange={setIsCampusDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCampus ? 'Edit Campus' : 'Add Campus'}</DialogTitle>
            <DialogDescription>Update campus metadata and status.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={campusForm.handleSubmit(saveCampus)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...campusForm.register('name', { required: true })} />
              </div>
              {!editingCampus ? (
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input {...campusForm.register('code')} />
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input {...campusForm.register('address')} />
              </div>
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input {...campusForm.register('contact')} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...campusForm.register('email')} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={campusForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Picture URL</Label>
              <Input {...campusForm.register('picture')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCampusDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={campusForm.formState.isSubmitting}>
                {editingCampus ? 'Save Changes' : 'Create Campus'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSchoolDialogOpen} onOpenChange={setIsSchoolDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Teaching School</DialogTitle>
            <DialogDescription>Create a new school under the current campus.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={schoolForm.handleSubmit(saveSchool)}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...schoolForm.register('name', { required: true })} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...schoolForm.register('location')} />
              </div>
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input {...schoolForm.register('contact')} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...schoolForm.register('email')} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={schoolForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Picture URL</Label>
              <Input {...schoolForm.register('picture')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSchoolDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={schoolForm.formState.isSubmitting}>
                Create School
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Create a new non-teaching department.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={departmentForm.handleSubmit(saveDepartment)}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...departmentForm.register('name', { required: true })} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...departmentForm.register('location')} />
              </div>
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input {...departmentForm.register('contact')} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...departmentForm.register('email')} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={departmentForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Picture URL</Label>
              <Input {...departmentForm.register('picture')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDepartmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={departmentForm.formState.isSubmitting}>
                Create Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmployeesPage;
