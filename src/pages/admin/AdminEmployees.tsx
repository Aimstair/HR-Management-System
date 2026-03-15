import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

type EmployeeType = 'Academic' | 'Non-Academic';
type EmployeeTitle = 'Staff' | 'Faculty' | 'Chairman' | 'Dean' | 'HR Admin';
type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

type FilterTypeOption = EmployeeType | 'All';
type FilterStatusOption = EmployeeStatus | 'All';
type FilterDivisionOption = string | 'All';

interface DivisionConfig {
  id: string;
  name: string;
  type: EmployeeType;
  departments: string[];
}

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  employeeType: EmployeeType;
  division: string;
  department: string;
  title: EmployeeTitle;
  status: EmployeeStatus;
}

interface EmployeeFormValues {
  name: string;
  email: string;
  employeeType: EmployeeType;
  division: string;
  department: string;
  title: EmployeeTitle;
  status: EmployeeStatus;
}

const TITLE_OPTIONS: EmployeeTitle[] = ['Staff', 'Faculty', 'Chairman', 'Dean', 'HR Admin'];
const STATUS_OPTIONS: EmployeeStatus[] = ['Active', 'On Leave', 'Inactive'];
const PAGE_SIZE = 5;

const DIVISIONS: DivisionConfig[] = [
  {
    id: 'DIV-NA-HR',
    name: 'HR',
    type: 'Non-Academic',
    departments: ['Human Resources', 'Employee Relations'],
  },
  {
    id: 'DIV-NA-ACC',
    name: 'Accounting',
    type: 'Non-Academic',
    departments: ['Payroll', 'Accounts Payable'],
  },
  {
    id: 'DIV-NA-REG',
    name: 'Registrar',
    type: 'Non-Academic',
    departments: ['Records Processing', 'Enrollment Services'],
  },
  {
    id: 'DIV-NA-SAO',
    name: 'Student Affairs Office',
    type: 'Non-Academic',
    departments: ['Counseling Services', 'Student Programs'],
  },
  {
    id: 'DIV-NA-SEC',
    name: 'Security',
    type: 'Non-Academic',
    departments: ['Campus Patrol', 'Gate Operations'],
  },
  {
    id: 'DIV-NA-MTN',
    name: 'Maintenance',
    type: 'Non-Academic',
    departments: ['Janitorial', 'Repair Staff'],
  },
  {
    id: 'DIV-AC-ENG',
    name: 'School of Engineering',
    type: 'Academic',
    departments: ['Computer Engineering', 'Civil Engineering'],
  },
  {
    id: 'DIV-AC-AS',
    name: 'School of Arts & Sciences',
    type: 'Academic',
    departments: ['Biology', 'Chemistry'],
  },
  {
    id: 'DIV-AC-BM',
    name: 'School of Business & Management',
    type: 'Academic',
    departments: ['Business Administration', 'Accountancy'],
  },
  {
    id: 'DIV-AC-EDU',
    name: 'School of Education',
    type: 'Academic',
    departments: ['Elementary Education', 'Secondary Education'],
  },
  {
    id: 'DIV-AC-LAW',
    name: 'School of Law',
    type: 'Academic',
    departments: ['Juris Doctor Program'],
  },
  {
    id: 'DIV-AC-CS',
    name: 'School of Computer Studies',
    type: 'Academic',
    departments: ['Information Technology', 'Computer Science'],
  },
];

const initialEmployees: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    name: 'Dr. Amelia Smith',
    email: 'amelia.smith@school.edu',
    employeeType: 'Academic',
    division: 'School of Engineering',
    department: 'Computer Engineering',
    title: 'Dean',
    status: 'Active',
  },
  {
    id: 'EMP-002',
    name: 'Engr. Marco Doe',
    email: 'marco.doe@school.edu',
    employeeType: 'Academic',
    division: 'School of Engineering',
    department: 'Computer Engineering',
    title: 'Chairman',
    status: 'Active',
  },
  {
    id: 'EMP-003',
    name: 'Prof. Liza Ramos',
    email: 'liza.ramos@school.edu',
    employeeType: 'Academic',
    division: 'School of Arts & Sciences',
    department: 'Biology',
    title: 'Faculty',
    status: 'Active',
  },
  {
    id: 'EMP-004',
    name: 'Atty. Noel Fernandez',
    email: 'noel.fernandez@school.edu',
    employeeType: 'Academic',
    division: 'School of Law',
    department: 'Juris Doctor Program',
    title: 'Dean',
    status: 'On Leave',
  },
  {
    id: 'EMP-005',
    name: 'Irene Velasco',
    email: 'irene.velasco@school.edu',
    employeeType: 'Non-Academic',
    division: 'HR',
    department: 'Human Resources',
    title: 'HR Admin',
    status: 'Active',
  },
  {
    id: 'EMP-006',
    name: 'Joel Santos',
    email: 'joel.santos@school.edu',
    employeeType: 'Non-Academic',
    division: 'Accounting',
    department: 'Payroll',
    title: 'Staff',
    status: 'Active',
  },
  {
    id: 'EMP-007',
    name: 'Maria Cruz',
    email: 'maria.cruz@school.edu',
    employeeType: 'Non-Academic',
    division: 'Maintenance',
    department: 'Janitorial',
    title: 'Staff',
    status: 'Active',
  },
  {
    id: 'EMP-008',
    name: 'Rico Navarro',
    email: 'rico.navarro@school.edu',
    employeeType: 'Non-Academic',
    division: 'Security',
    department: 'Campus Patrol',
    title: 'Staff',
    status: 'Inactive',
  },
  {
    id: 'EMP-009',
    name: 'Prof. Elena Torres',
    email: 'elena.torres@school.edu',
    employeeType: 'Academic',
    division: 'School of Computer Studies',
    department: 'Computer Science',
    title: 'Faculty',
    status: 'Active',
  },
  {
    id: 'EMP-010',
    name: 'Mark Reyes',
    email: 'mark.reyes@school.edu',
    employeeType: 'Non-Academic',
    division: 'Student Affairs Office',
    department: 'Counseling Services',
    title: 'Staff',
    status: 'Active',
  },
];

const statusBadgeClass: Record<EmployeeStatus, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
};

const getDefaultValues = (): EmployeeFormValues => ({
  name: '',
  email: '',
  employeeType: 'Academic',
  division: 'School of Engineering',
  department: 'Computer Engineering',
  title: 'Faculty',
  status: 'Active',
});

const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterTypeOption>('All');
  const [filterStatus, setFilterStatus] = useState<FilterStatusOption>('All');
  const [filterDivision, setFilterDivision] = useState<FilterDivisionOption>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    defaultValues: getDefaultValues(),
  });

  const formEmployeeType = watch('employeeType');
  const formDivision = watch('division');
  const formDepartment = watch('department');

  const divisionOptions = useMemo(() => {
    return DIVISIONS.filter((division) => division.type === formEmployeeType);
  }, [formEmployeeType]);

  const departmentOptions = useMemo(() => {
    const division = divisionOptions.find((item) => item.name === formDivision);
    return division ? division.departments : [];
  }, [divisionOptions, formDivision]);

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    if (!divisionOptions.some((division) => division.name === formDivision)) {
      const nextDivision = divisionOptions[0]?.name ?? '';
      setValue('division', nextDivision, { shouldValidate: true });

      const nextDepartments =
        DIVISIONS.find((division) => division.name === nextDivision)?.departments ?? [];
      setValue('department', nextDepartments[0] ?? '', { shouldValidate: true });
    }
  }, [divisionOptions, formDivision, isDialogOpen, setValue]);

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    if (!departmentOptions.includes(formDepartment)) {
      setValue('department', departmentOptions[0] ?? '', { shouldValidate: true });
    }
  }, [departmentOptions, formDepartment, isDialogOpen, setValue]);

  const filterDivisionOptions = useMemo(() => {
    const names = Array.from(new Set(employees.map((employee) => employee.division))).sort();
    return names;
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !term ||
        employee.name.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term);

      const matchesType = filterType === 'All' || employee.employeeType === filterType;
      const matchesStatus = filterStatus === 'All' || employee.status === filterStatus;
      const matchesDivision = filterDivision === 'All' || employee.division === filterDivision;

      return matchesSearch && matchesType && matchesStatus && matchesDivision;
    });
  }, [employees, filterDivision, filterStatus, filterType, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus, filterDivision]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredEmployees]);

  const closeModal = (): void => {
    setIsDialogOpen(false);
    setEditingEmployeeId(null);
    reset(getDefaultValues());
    clearErrors();
  };

  const openAddDialog = (): void => {
    setEditingEmployeeId(null);
    reset(getDefaultValues());
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: EmployeeRecord): void => {
    setEditingEmployeeId(employee.id);
    reset({
      name: employee.name,
      email: employee.email,
      employeeType: employee.employeeType,
      division: employee.division,
      department: employee.department,
      title: employee.title,
      status: employee.status,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const onSubmit = (values: EmployeeFormValues): void => {
    const payload: Omit<EmployeeRecord, 'id'> = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      employeeType: values.employeeType,
      division: values.division,
      department: values.department,
      title: values.title,
      status: values.status,
    };

    if (editingEmployeeId) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === editingEmployeeId ? { ...employee, ...payload } : employee,
        ),
      );
      toast.success(`Employee ${payload.name} updated successfully.`);
    } else {
      const nextIdNumber =
        employees.reduce((max, employee) => {
          const numeric = Number(employee.id.replace('EMP-', ''));
          return Number.isNaN(numeric) ? max : Math.max(max, numeric);
        }, 0) + 1;

      const generatedId = `EMP-${String(nextIdNumber).padStart(3, '0')}`;
      setEmployees((current) => [{ id: generatedId, ...payload }, ...current]);
      toast.success(`Employee ${payload.name} added successfully.`);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Employee Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage employee records with filters, paging, and cascading form fields.
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Master Data</CardTitle>
          <CardDescription>Search, filter, and paginate employee records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterTypeOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Non-Academic">Non-Academic</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatusOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterDivision}
              onValueChange={(value) => setFilterDivision(value as FilterDivisionOption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Divisions</SelectItem>
                {filterDivisionOptions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              Showing {paginatedEmployees.length} of {filteredEmployees.length} filtered employees
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('All');
                setFilterStatus('All');
                setFilterDivision('All');
              }}
            >
              Reset Filters
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      No employees matched your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.employeeType}</TableCell>
                      <TableCell>{employee.division}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.title}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass[employee.status]}>{employee.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(employee)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeModal())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <DialogDescription>
              Fill in required fields. Division and Department update automatically by Employee Type.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="employee-name">Name</Label>
              <Input
                id="employee-name"
                {...register('name', { required: 'Name is required', minLength: 2 })}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input
                id="employee-email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
                placeholder="name@school.edu"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Employee Type</Label>
              <Controller
                control={control}
                name="employeeType"
                rules={{ required: true }}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as EmployeeType)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(['Academic', 'Non-Academic'] as EmployeeType[]).map((type) => (
                      <label key={type} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                        <RadioGroupItem value={type} id={`employee-type-${type}`} />
                        <span>{type}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Division</Label>
                <Controller
                  control={control}
                  name="division"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisionOptions.map((division) => (
                          <SelectItem key={division.id} value={division.name}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="department"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Controller
                  control={control}
                  name="title"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as EmployeeTitle)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        {TITLE_OPTIONS.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value as EmployeeStatus)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingEmployeeId ? 'Save Changes' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmployees;
