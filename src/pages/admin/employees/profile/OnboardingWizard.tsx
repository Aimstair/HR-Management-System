import React, { useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react';
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
import { Checkbox } from '../../../../../components/ui/checkbox';
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
  middleName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
  presentAddress: string;
  presentAddressZipCode: string;
  permanentAddress: string;
  permanentAddressZipCode: string;
  profilePicture: string;

  username: string;
  email: string;
  temporaryPassword: string;

  idNumber: string;
  position: string;
  dateHired: string;
  sssId: string;
  pagIbigId: string;
  tinNo: string;
  philhealthNo: string;
  role: EmployeeNode['role'];

  campusId: string;
  departmentId: string;
  schoolId: string;

  noLate: boolean;
  noOvertime: boolean;
  noNightDifferentialPay: boolean;
  noMinimumHours: boolean;
  noHolidayPay: boolean;
  noPremiumOnOvertime: boolean;

  bankAccounts: Array<{
    bankName: string;
    accountNo: string;
  }>;

  fundRequestLimit: number;
  allowManyPendingFundRequests: boolean;
}

const steps = ['Personal', 'Credentials', 'Employment & Team', 'Privileges & Bank', 'Review'];

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
      middleName: '',
      lastName: '',
      birthDate: '',
      phoneNumber: '',
      presentAddress: '',
      presentAddressZipCode: '',
      permanentAddress: '',
      permanentAddressZipCode: '',
      profilePicture: '',
      username: '',
      email: '',
      temporaryPassword: 'Welcome123!',
      idNumber: '',
      position: '',
      dateHired: '',
      sssId: '',
      pagIbigId: '',
      tinNo: '',
      philhealthNo: '',
      role: 'Staff',
      campusId: campuses[0]?.id ?? '',
      departmentId: campuses[0]?.departments[0]?.id ?? '',
      schoolId: '',
      noLate: false,
      noOvertime: false,
      noNightDifferentialPay: false,
      noMinimumHours: false,
      noHolidayPay: false,
      noPremiumOnOvertime: false,
      bankAccounts: [{ bankName: '', accountNo: '' }],
      fundRequestLimit: 10000,
      allowManyPendingFundRequests: false,
    },
  });

  const values = watch();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankAccounts',
  });

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
      setValue('schoolId', schoolOptions[0]?.id ?? '');
    }
  }, [schoolOptions, selectedDepartment, setValue, values.schoolId]);

  const closeWizard = (): void => {
    setStep(0);
    reset();
    onOpenChange(false);
  };

  const validateStep = async (): Promise<boolean> => {
    if (step === 0) {
      return trigger([
        'firstName',
        'lastName',
        'birthDate',
        'phoneNumber',
        'presentAddress',
        'presentAddressZipCode',
        'permanentAddress',
        'permanentAddressZipCode',
      ]);
    }

    if (step === 1) {
      return trigger(['username', 'email', 'temporaryPassword']);
    }

    if (step === 2) {
      if (selectedDepartment?.name === 'Teaching Faculties') {
        return trigger([
          'idNumber',
          'position',
          'dateHired',
          'sssId',
          'pagIbigId',
          'tinNo',
          'philhealthNo',
          'campusId',
          'departmentId',
          'schoolId',
          'role',
        ]);
      }

      return trigger([
        'idNumber',
        'position',
        'dateHired',
        'sssId',
        'pagIbigId',
        'tinNo',
        'philhealthNo',
        'campusId',
        'departmentId',
        'role',
      ]);
    }

    if (step === 3) {
      return trigger(['fundRequestLimit', 'bankAccounts']);
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
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ').trim();
    const schoolName = schoolOptions.find((school) => school.id === data.schoolId)?.name;

    const newEmployee: EmployeeNode = {
      id,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      fullName,
      jobTitle: data.position,
      role: data.role,
      status: 'Active',
      profilePicture: data.profilePicture,
      avatarUrl: data.profilePicture,

      birthDate: data.birthDate,
      dateOfBirth: data.birthDate,
      phoneNumber: data.phoneNumber,
      phone: data.phoneNumber,
      presentAddress: data.presentAddress,
      presentAddressZipCode: data.presentAddressZipCode,
      permanentAddress: data.permanentAddress,
      permanentAddressZipCode: data.permanentAddressZipCode,
      address: data.presentAddress,

      username: data.username,
      email: data.email,
      temporaryPassword: data.temporaryPassword,

      idNumber: data.idNumber,
      position: data.position,
      dateHired: data.dateHired,
      sssId: data.sssId,
      pagIbigId: data.pagIbigId,
      tinNo: data.tinNo,
      philhealthNo: data.philhealthNo,

      schoolName: schoolName ?? 'N/A',
      departmentName: selectedDepartment?.name ?? 'N/A',

      privileges: {
        noLate: data.noLate,
        noOvertime: data.noOvertime,
        noNightDifferentialPay: data.noNightDifferentialPay,
        noMinimumHours: data.noMinimumHours,
        noHolidayPay: data.noHolidayPay,
        noPremiumOnOvertime: data.noPremiumOnOvertime,
      },

      bankAccounts: data.bankAccounts.map((account, index) => ({
        id: `${id}-BA${index + 1}`,
        bankName: account.bankName,
        accountNo: account.accountNo,
      })),
      bankName: data.bankAccounts[0]?.bankName || '',
      accountName: fullName,
      accountNumber: data.bankAccounts[0]?.accountNo || '',

      fundRequestLimit: Number(data.fundRequestLimit) || 0,
      allowManyPendingFundRequests: data.allowManyPendingFundRequests,

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
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Employee Onboarding Wizard</DialogTitle>
          <DialogDescription>Provide all required employee details before creating the profile.</DialogDescription>
        </DialogHeader>

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
            <form className="space-y-5" onSubmit={handleSubmit(submit)}>
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2"><Label>First Name</Label><Input {...register('firstName', { required: true })} /></div>
                    <div className="space-y-2"><Label>Middle Name</Label><Input {...register('middleName')} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input {...register('lastName', { required: true })} /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Birth Date</Label><Input type="date" {...register('birthDate', { required: true })} /></div>
                    <div className="space-y-2"><Label>Phone Number</Label><Input {...register('phoneNumber', { required: true })} /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Present Address</Label><Input {...register('presentAddress', { required: true })} /></div>
                    <div className="space-y-2"><Label>Present Address Zip Code</Label><Input {...register('presentAddressZipCode', { required: true })} /></div>
                    <div className="space-y-2"><Label>Permanent Address</Label><Input {...register('permanentAddress', { required: true })} /></div>
                    <div className="space-y-2"><Label>Permanent Address Zip Code</Label><Input {...register('permanentAddressZipCode', { required: true })} /></div>
                  </div>
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    <p className="mb-2 font-medium">Profile Picture</p>
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Upload className="h-4 w-4" /> Upload Picture (Coming Soon)
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Username</Label><Input {...register('username', { required: true })} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email', { required: true })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Temporary Password</Label><Input type="password" {...register('temporaryPassword', { required: true })} /></div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>ID Number</Label><Input {...register('idNumber', { required: true })} /></div>
                    <div className="space-y-2"><Label>Position</Label><Input {...register('position', { required: true })} /></div>
                    <div className="space-y-2"><Label>Date Hired</Label><Input type="date" {...register('dateHired', { required: true })} /></div>
                    <div className="space-y-2"><Label>SSS ID</Label><Input {...register('sssId', { required: true })} /></div>
                    <div className="space-y-2"><Label>Pag-IBIG ID</Label><Input {...register('pagIbigId', { required: true })} /></div>
                    <div className="space-y-2"><Label>TIN No</Label><Input {...register('tinNo', { required: true })} /></div>
                    <div className="space-y-2"><Label>PhilHealth No</Label><Input {...register('philhealthNo', { required: true })} /></div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      ['noLate', 'No Late'],
                      ['noOvertime', 'No Overtime'],
                      ['noNightDifferentialPay', 'No Night Differential Pay'],
                      ['noMinimumHours', 'No Minimum Hours'],
                      ['noHolidayPay', 'No Holiday Pay'],
                      ['noPremiumOnOvertime', 'No Premium on Overtime'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <Controller
                          control={control}
                          name={key as keyof WizardValues}
                          render={({ field }) => (
                            <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          )}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Details</Label>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                          <Input {...register(`bankAccounts.${index}.bankName` as const, { required: true })} placeholder="Bank name" />
                          <Input {...register(`bankAccounts.${index}.accountNo` as const, { required: true })} placeholder="Account no" />
                          <Button type="button" variant="outline" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ bankName: '', accountNo: '' })}>
                      <Plus className="h-4 w-4" /> Add Bank Account
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Fund Request Limit</Label><Input type="number" {...register('fundRequestLimit', { required: true, valueAsNumber: true })} /></div>
                    <label className="mt-8 flex items-center gap-2 text-sm">
                      <Controller
                        control={control}
                        name="allowManyPendingFundRequests"
                        render={({ field }) => (
                          <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                        )}
                      />
                      <span>Allow Many Pending Fund Requests</span>
                    </label>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Personal Information</p>
                    <p>{values.firstName} {values.middleName} {values.lastName}</p>
                    <p className="text-muted-foreground">Birth Date: {values.birthDate || 'N/A'}</p>
                    <p className="text-muted-foreground">Phone: {values.phoneNumber || 'N/A'}</p>
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Employment & Team</p>
                    <p>{values.position || 'N/A'} | {values.idNumber || 'N/A'}</p>
                    <p className="text-muted-foreground">Role: {values.role}</p>
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">Credentials & Funds</p>
                    <p>{values.username} | {values.email}</p>
                    <p className="text-muted-foreground">Fund Request Limit: {values.fundRequestLimit || 0}</p>
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
