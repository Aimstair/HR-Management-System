import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CheckCircle2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import type { CampusNode, EmployeeNode } from '../types';

interface OnboardingWizardProps {
  open: boolean;
  campuses: CampusNode[];
  onOpenChange: (open: boolean) => void;
  onCreated: (employee: EmployeeNode, campusId: string, departmentId: string, schoolId: string | null) => void;
}

interface WizardValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  campusId: string;
  departmentId: string;
  schoolId: string;
  role: EmployeeNode['role'];
  email: string;
  phone: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const steps = ['Personal', 'Placement', 'Contact & Financials', 'Review'];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  campuses,
  onOpenChange,
  onCreated,
}) => {
  const [step, setStep] = useState<number>(0);

  const { control, register, watch, setValue, trigger, handleSubmit, reset } = useForm<WizardValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      campusId: campuses[0]?.id ?? '',
      departmentId: campuses[0]?.departments[0]?.id ?? '',
      schoolId: '',
      role: 'Staff',
      email: '',
      phone: '',
      address: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  });

  const values = watch();

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === values.campusId) ?? null,
    [campuses, values.campusId],
  );

  const departments = selectedCampus?.departments ?? [];
  const selectedDepartment = departments.find((department) => department.id === values.departmentId) ?? null;
  const schoolOptions = selectedDepartment?.name === 'Teaching Faculties' ? selectedDepartment.schools ?? [] : [];

  React.useEffect(() => {
    if (!selectedCampus) {
      return;
    }

    if (!departments.some((department) => department.id === values.departmentId)) {
      const nextDepartmentId = departments[0]?.id ?? '';
      if (values.departmentId !== nextDepartmentId) {
        setValue('departmentId', nextDepartmentId);
      }
      if (values.schoolId !== '') {
        setValue('schoolId', '');
      }
    }
  }, [departments, selectedCampus, setValue, values.departmentId, values.schoolId]);

  React.useEffect(() => {
    if (selectedDepartment?.name !== 'Teaching Faculties') {
      if (values.schoolId !== '') {
        setValue('schoolId', '');
      }
      return;
    }

    if (!schoolOptions.some((school) => school.id === values.schoolId)) {
      const nextSchoolId = schoolOptions[0]?.id ?? '';
      if (values.schoolId !== nextSchoolId) {
        setValue('schoolId', nextSchoolId);
      }
    }
  }, [schoolOptions, selectedDepartment, setValue, values.schoolId]);

  const closeWizard = (): void => {
    setStep(0);
    reset();
    onOpenChange(false);
  };

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) {
      return trigger(['firstName', 'lastName', 'dateOfBirth']);
    }
    if (step === 1) {
      if (selectedDepartment?.name === 'Teaching Faculties') {
        return trigger(['campusId', 'departmentId', 'schoolId', 'role']);
      }
      return trigger(['campusId', 'departmentId', 'role']);
    }
    if (step === 2) {
      return trigger(['email', 'phone', 'address', 'bankName', 'accountName', 'accountNumber']);
    }
    return true;
  };

  const nextStep = async (): Promise<void> => {
    if (!(await validateStep())) {
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const prevStep = (): void => setStep((current) => Math.max(current - 1, 0));

  const submit = (data: WizardValues): void => {
    const id = `EMP-${Date.now().toString().slice(-6)}`;
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const schoolName = schoolOptions.find((school) => school.id === data.schoolId)?.name;

    const newEmployee: EmployeeNode = {
      id,
      fullName,
      jobTitle:
        data.role === 'Faculty'
          ? `Professor of ${schoolName ?? selectedDepartment?.name ?? 'Department'}`
          : data.role === 'Dean'
          ? `Dean, ${schoolName ?? 'School'}`
          : `${data.role} - ${selectedDepartment?.name ?? 'Department'}`,
      role: data.role,
      email: data.email,
      phone: data.phone,
      status: 'Active',
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      leaveCredits: [],
      studyLoads: schoolName
        ? [
            {
              id: `SL-${Date.now().toString().slice(-4)}`,
              subject: `${schoolName} Orientation`,
              units: 3,
              schedule: 'TBA',
            },
          ]
        : [],
    };

    onCreated(newEmployee, data.campusId, data.departmentId, schoolName ? data.schoolId : null);
    toast.success('Employee onboarding completed successfully.');
    closeWizard();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? closeWizard() : onOpenChange(nextOpen))}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Employee Onboarding Wizard</DialogTitle>
          <DialogDescription>Complete each step and submit to create a new employee profile.</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Step {step + 1}: {steps[step]}</CardTitle>
            <CardDescription>Use Next/Prev to navigate through onboarding.</CardDescription>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
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

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(submit)}>
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>First Name</Label><Input {...register('firstName', { required: true })} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input {...register('lastName', { required: true })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" {...register('dateOfBirth', { required: true })} /></div>
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    <p className="mb-2 font-medium">Avatar Upload Placeholder</p>
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Upload className="h-4 w-4" /> Upload Avatar (Coming Soon)
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campus</Label>
                    <Controller
                      control={control}
                      name="campusId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select campus" /></SelectTrigger>
                          <SelectContent>
                            {campuses.map((campus) => (
                              <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
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
                      name="departmentId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {selectedDepartment?.name === 'Teaching Faculties' ? (
                    <div className="space-y-2">
                      <Label>School</Label>
                      <Controller
                        control={control}
                        name="schoolId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select school" /></SelectTrigger>
                            <SelectContent>
                              {schoolOptions.map((school) => (
                                <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Controller
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Staff">Staff</SelectItem>
                            <SelectItem value="Faculty">Faculty</SelectItem>
                            <SelectItem value="Chairman">Chairman</SelectItem>
                            <SelectItem value="Dean">Dean</SelectItem>
                            <SelectItem value="HR Admin">HR Admin</SelectItem>
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
                    <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email', { required: true })} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input {...register('phone', { required: true })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Address</Label><Input {...register('address', { required: true })} /></div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2"><Label>Bank Name</Label><Input {...register('bankName', { required: true })} /></div>
                    <div className="space-y-2"><Label>Account Name</Label><Input {...register('accountName', { required: true })} /></div>
                    <div className="space-y-2"><Label>Account Number</Label><Input {...register('accountNumber', { required: true })} /></div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-3">
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Personal</p>
                    <p>{values.firstName} {values.lastName}</p>
                    <p className="text-muted-foreground">DOB: {values.dateOfBirth || 'N/A'}</p>
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Placement</p>
                    <p>{selectedCampus?.name ?? 'N/A'}</p>
                    <p>{selectedDepartment?.name ?? 'N/A'}</p>
                    {values.schoolId ? <p>{schoolOptions.find((school) => school.id === values.schoolId)?.name}</p> : null}
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Contact & Financials</p>
                    <p>{values.email} | {values.phone}</p>
                    <p>{values.bankName} - {values.accountNumber}</p>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Review complete. Submit to finish onboarding.
                  </p>
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={closeWizard}>Cancel</Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>Next <ChevronRight className="h-4 w-4" /></Button>
                  ) : (
                    <Button type="submit">Submit</Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
