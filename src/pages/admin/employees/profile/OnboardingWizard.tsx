import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import {
  createAdminEmployee,
  type AdminEmployeeRecord,
} from '../../../../lib/admin-api';
import type { CampusNode, EmployeeNode } from '../types';

interface OnboardingWizardProps {
  open: boolean;
  campuses: CampusNode[];
  onOpenChange: (open: boolean) => void;
  onCreated: (
    employee: EmployeeNode,
    scope: { campusId: string; departmentId: string | null; teachingSchoolId: string | null },
  ) => void;
}

interface WizardValues {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  temporaryPassword: string;
  campusId: string;
  departmentId: string;
  teachingSchoolId: string;
  teachingDepartmentId: string;
}

const steps = ['Basic Info', 'Assignment', 'Review'];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  campuses,
  onOpenChange,
  onCreated,
}) => {
  const [step, setStep] = useState<number>(0);

  const { control, register, watch, setValue, trigger, handleSubmit, reset, formState } = useForm<WizardValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      temporaryPassword: 'Welcome123!',
      campusId: campuses[0]?.id ?? '',
      departmentId: campuses[0]?.departments[0]?.id ?? '',
      teachingSchoolId: '',
      teachingDepartmentId: '',
    },
  });

  const values = watch();

  React.useEffect(() => {
    if (!open || campuses.length === 0) {
      return;
    }

    const nextCampus = campuses.find((campus) => campus.id === values.campusId) ?? campuses[0];
    if (nextCampus && values.campusId !== nextCampus.id) {
      setValue('campusId', nextCampus.id);
    }

    const departmentList = nextCampus?.departments ?? [];
    const nextDepartment = departmentList.find((department) => department.id === values.departmentId) ?? departmentList[0];
    if (nextDepartment && values.departmentId !== nextDepartment.id) {
      setValue('departmentId', nextDepartment.id);
    }
  }, [campuses, open, setValue, values.campusId, values.departmentId]);

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === values.campusId) ?? null,
    [campuses, values.campusId],
  );

  const departments = selectedCampus?.departments ?? [];
  const selectedDepartment = departments.find((department) => department.id === values.departmentId) ?? null;
  const schoolOptions = selectedDepartment?.name === 'Teaching Faculties' ? selectedDepartment.schools ?? [] : [];
  const selectedSchool = schoolOptions.find((school) => school.id === values.teachingSchoolId) ?? null;
  const teachingDepartmentOptions = selectedSchool?.departments ?? [];

  React.useEffect(() => {
    if (!selectedCampus) {
      return;
    }

    if (!departments.some((department) => department.id === values.departmentId)) {
      const nextDepartmentId = departments[0]?.id ?? '';
      if (values.departmentId !== nextDepartmentId) {
        setValue('departmentId', nextDepartmentId);
      }
      if (values.teachingSchoolId !== '') {
        setValue('teachingSchoolId', '');
      }
      if (values.teachingDepartmentId !== '') {
        setValue('teachingDepartmentId', '');
      }
    }
  }, [departments, selectedCampus, setValue, values.departmentId, values.teachingDepartmentId, values.teachingSchoolId]);

  React.useEffect(() => {
    if (selectedDepartment?.name !== 'Teaching Faculties') {
      if (values.teachingSchoolId !== '') {
        setValue('teachingSchoolId', '');
      }
      if (values.teachingDepartmentId !== '') {
        setValue('teachingDepartmentId', '');
      }
      return;
    }

    if (!schoolOptions.some((school) => school.id === values.teachingSchoolId)) {
      setValue('teachingSchoolId', schoolOptions[0]?.id ?? '');
    }
  }, [schoolOptions, selectedDepartment, setValue, values.teachingDepartmentId, values.teachingSchoolId]);

  React.useEffect(() => {
    if (selectedDepartment?.name !== 'Teaching Faculties') {
      return;
    }

    if (!teachingDepartmentOptions.some((department) => department.id === values.teachingDepartmentId)) {
      setValue('teachingDepartmentId', teachingDepartmentOptions[0]?.id ?? '');
    }
  }, [selectedDepartment, setValue, teachingDepartmentOptions, values.teachingDepartmentId]);

  const closeWizard = (): void => {
    setStep(0);
    reset();
    onOpenChange(false);
  };

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) {
      return trigger(['firstName', 'lastName', 'email', 'temporaryPassword']);
    }

    if (step === 1) {
      if (selectedDepartment?.name === 'Teaching Faculties') {
        return trigger(['campusId', 'departmentId', 'teachingSchoolId', 'teachingDepartmentId', 'position']);
      }

      return trigger(['campusId', 'departmentId', 'position']);
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

  const toEmployeeNode = (employee: AdminEmployeeRecord): EmployeeNode => {
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

  const submit = async (data: WizardValues): Promise<void> => {
    const isTeaching = selectedDepartment?.name === 'Teaching Faculties';
    const departmentId = isTeaching ? data.teachingDepartmentId : data.departmentId;

    if (!data.campusId) {
      toast.error('Select a campus before submitting.');
      return;
    }

    if (isTeaching && !data.teachingSchoolId) {
      toast.error('Select a teaching school before submitting.');
      return;
    }

    if (!departmentId) {
      toast.error('Select a valid department.');
      return;
    }

    try {
      const response = await createAdminEmployee({
        email: data.email.trim().toLowerCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        employeeType: isTeaching ? 'TEACHING' : 'NON_TEACHING',
        schoolId: data.campusId,
        departmentId,
        position: data.position.trim() || null,
        temporaryPassword: data.temporaryPassword,
      });

      onCreated(toEmployeeNode(response.employee), {
        campusId: data.campusId,
        departmentId,
        teachingSchoolId: isTeaching ? data.teachingSchoolId : null,
      });
      toast.success('Employee onboarding completed successfully.');
      closeWizard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create employee.');
    }
  };


  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? closeWizard() : onOpenChange(nextOpen))}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Employee Onboarding Wizard</DialogTitle>
          <DialogDescription>Provide all required employee details before creating the profile.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh] pr-4">
          <Card>
            <CardHeader>
              <CardTitle>Step {step + 1}: {steps[step]}</CardTitle>
              <CardDescription>Use Next/Prev to navigate through onboarding.</CardDescription>
              <div className="grid grid-cols-5 gap-2">
                {steps.map((label, index) => (
                  <div
                    key={label}
                    className={`rounded-md border px-2 py-2 text-center text-xs ${
                      index <= step ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>First Name</Label><Input {...register('firstName', { required: true })} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input {...register('lastName', { required: true })} /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        {...register('email', {
                          required: 'Email is required.',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address.',
                          },
                        })}
                      />
                      {formState.errors.email && (
                        <p className="text-xs text-destructive">{formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2"><Label>Temporary Password</Label><Input type="password" {...register('temporaryPassword', { required: true })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Position</Label><Input {...register('position', { required: true })} /></div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Campus</Label>
                      <Controller
                        control={control}
                        name="campusId"
                        rules={{ required: true }}
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
                      {formState.errors.campusId && (
                        <p className="text-xs text-destructive">Select a campus.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Controller
                        control={control}
                        name="departmentId"
                        rules={{ required: true }}
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
                      {formState.errors.departmentId && (
                        <p className="text-xs text-destructive">Select a department.</p>
                      )}
                    </div>
                  </div>

                  {selectedDepartment?.name === 'Teaching Faculties' ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Teaching School</Label>
                        <Controller
                          control={control}
                          name="teachingSchoolId"
                          rules={{ required: true }}
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
                        {formState.errors.teachingSchoolId && (
                          <p className="text-xs text-destructive">Select a teaching school.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Teaching Department</Label>
                        <Controller
                          control={control}
                          name="teachingDepartmentId"
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                              <SelectContent>
                                {teachingDepartmentOptions.map((department) => (
                                  <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {formState.errors.teachingDepartmentId && (
                          <p className="text-xs text-destructive">Select a teaching department.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Basic Info</p>
                    <p>{values.firstName} {values.lastName}</p>
                    <p className="text-muted-foreground">Email: {values.email || 'N/A'}</p>
                    <p className="text-muted-foreground">Position: {values.position || 'N/A'}</p>
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Assignment</p>
                    <p>{selectedCampus?.name || 'N/A'}</p>
                    <p className="text-muted-foreground">Department: {selectedDepartment?.name || 'N/A'}</p>
                    {selectedDepartment?.name === 'Teaching Faculties' ? (
                      <p className="text-muted-foreground">School: {selectedSchool?.name || 'N/A'}</p>
                    ) : null}
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
                      <Button
                        type="button"
                        disabled={formState.isSubmitting}
                        onClick={() => void handleSubmit(submit)()}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
