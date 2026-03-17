import React, { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CheckCircle2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
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

type EmployeeRole = 'Faculty' | 'Staff' | 'Chairman' | 'Dean' | 'HR Admin';
type EmployeeType = 'Academic' | 'Non-Academic';

interface EmployeeProfile {
  id: string;
  fullName: string;
  jobTitle: string;
  role: EmployeeRole;
  employeeType: EmployeeType;
  division: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Retired';
  dateOfBirth: string;
  email: string;
  phone: string;
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

interface EmployeeWizardProps {
  onCancel: () => void;
  onCreated: (employee: EmployeeProfile) => void;
}

interface WizardFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  role: EmployeeRole;
  employeeType: EmployeeType;
  division: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface DivisionOption {
  id: string;
  name: string;
  type: EmployeeType;
  departments: string[];
}

const divisions: DivisionOption[] = [
  {
    id: 'DIV-AC-ENG',
    name: 'School of Engineering',
    type: 'Academic',
    departments: ['Computer Engineering', 'Civil Engineering'],
  },
  {
    id: 'DIV-AC-CS',
    name: 'School of Computer Studies',
    type: 'Academic',
    departments: ['Computer Science', 'Information Technology'],
  },
  {
    id: 'DIV-AC-LAW',
    name: 'School of Law',
    type: 'Academic',
    departments: ['Juris Doctor Program'],
  },
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
    id: 'DIV-NA-MTN',
    name: 'Maintenance',
    type: 'Non-Academic',
    departments: ['Janitorial', 'Repair Staff'],
  },
];

const roles: EmployeeRole[] = ['Faculty', 'Staff', 'Chairman', 'Dean', 'HR Admin'];
const stepLabels: string[] = ['Personal', 'Job', 'Contact & Bank', 'Review'];

const EmployeeWizard: React.FC<EmployeeWizardProps> = ({ onCancel, onCreated }) => {
  const [step, setStep] = useState<number>(0);

  const { register, control, watch, trigger, setValue, handleSubmit } = useForm<WizardFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      role: 'Staff',
      employeeType: 'Academic',
      division: 'School of Engineering',
      department: 'Computer Engineering',
      email: '',
      phone: '',
      address: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  });

  const values = watch();

  const divisionOptions = useMemo(() => {
    return divisions.filter((division) => division.type === values.employeeType);
  }, [values.employeeType]);

  const departmentOptions = useMemo(() => {
    const selectedDivision = divisionOptions.find((division) => division.name === values.division);
    return selectedDivision ? selectedDivision.departments : [];
  }, [divisionOptions, values.division]);

  React.useEffect(() => {
    if (!divisionOptions.some((division) => division.name === values.division)) {
      const nextDivision = divisionOptions[0]?.name ?? '';
      setValue('division', nextDivision);
      const nextDepartments = divisions.find((division) => division.name === nextDivision)?.departments ?? [];
      setValue('department', nextDepartments[0] ?? '');
    }
  }, [divisionOptions, setValue, values.division]);

  React.useEffect(() => {
    if (!departmentOptions.includes(values.department)) {
      setValue('department', departmentOptions[0] ?? '');
    }
  }, [departmentOptions, setValue, values.department]);

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) {
      return trigger(['firstName', 'lastName', 'dateOfBirth']);
    }

    if (step === 1) {
      return trigger(['role', 'employeeType', 'division', 'department']);
    }

    if (step === 2) {
      return trigger(['email', 'phone', 'address', 'bankName', 'accountName', 'accountNumber']);
    }

    return true;
  };

  const handleNext = async (): Promise<void> => {
    const valid = await validateStep();
    if (!valid) {
      return;
    }

    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  };

  const handlePrevious = (): void => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const onSubmit = (data: WizardFormValues): void => {
    const id = `EMP-${Date.now().toString().slice(-6)}`;
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const createdEmployee: EmployeeProfile = {
      id,
      fullName,
      jobTitle:
        data.role === 'Faculty'
          ? `Professor of ${data.department}`
          : data.role === 'Chairman'
          ? `Chairman, ${data.department}`
          : data.role === 'Dean'
          ? `Dean, ${data.division}`
          : `${data.role} - ${data.department}`,
      role: data.role,
      employeeType: data.employeeType,
      division: data.division,
      department: data.department,
      status: 'Active',
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phone: data.phone,
      address: data.address,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      leaveCredits: [],
      studyLoads:
        data.role === 'Faculty'
          ? [
              {
                id: `SL-${Date.now().toString().slice(-4)}`,
                subject: `${data.department} Orientation`,
                units: 3,
                schedule: 'TBA',
              },
            ]
          : [],
    };

    toast.success('Employee onboarding completed successfully.');
    onCreated(createdEmployee);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Employee Onboarding Wizard</h1>
        <p className="text-sm text-muted-foreground">Complete all steps to create a new employee profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step + 1}: {stepLabels[step]}</CardTitle>
          <CardDescription>Use Next and Previous to navigate between sections.</CardDescription>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {stepLabels.map((label, index) => (
              <div
                key={label}
                className={`rounded-md border px-2 py-2 text-center text-xs ${
                  index <= step ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input {...register('firstName', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input {...register('lastName', { required: true })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" {...register('dateOfBirth', { required: true })} />
                </div>
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  <p className="mb-2 font-medium">Avatar Upload Placeholder</p>
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Upload className="h-4 w-4" />
                    Upload Profile Picture (Coming Soon)
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => field.onChange(value as EmployeeRole)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employee Type</Label>
                    <Controller
                      control={control}
                      name="employeeType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={(value) => field.onChange(value as EmployeeType)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Non-Academic">Non-Academic</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Division</Label>
                    <Controller
                      control={control}
                      name="division"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisionOptions.map((division) => (
                              <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Controller
                    control={control}
                    name="department"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((department) => (
                            <SelectItem key={department} value={department}>{department}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register('email', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register('phone', { required: true })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...register('address', { required: true })} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input {...register('bankName', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input {...register('accountName', { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input {...register('accountNumber', { required: true })} />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <p className="font-semibold">Personal Info</p>
                  <p className="text-sm text-muted-foreground">{values.firstName} {values.lastName}</p>
                  <p className="text-sm text-muted-foreground">DOB: {values.dateOfBirth || 'N/A'}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="font-semibold">Job Details</p>
                  <p className="text-sm text-muted-foreground">{values.role} ({values.employeeType})</p>
                  <p className="text-sm text-muted-foreground">{values.division} / {values.department}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="font-semibold">Contact & Bank</p>
                  <p className="text-sm text-muted-foreground">{values.email} | {values.phone}</p>
                  <p className="text-sm text-muted-foreground">{values.bankName} - {values.accountNumber}</p>
                </div>
                <p className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Review complete. Submit to create this employee profile.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handlePrevious} disabled={step === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                {step < stepLabels.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit">Submit Employee</Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeWizard;
