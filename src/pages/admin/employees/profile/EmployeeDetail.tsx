import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Badge } from '../../../../../components/ui/badge';
import type { EmployeeNode } from '../types';

interface EmployeeDetailProps {
  employee: EmployeeNode;
  inSchoolContext: boolean;
  onBack: () => void;
  onSaveEmployee: (employee: EmployeeNode) => void;
}

interface PersonalFormValues {
  fullName: string;
  dateOfBirth: string;
  jobTitle: string;
}

interface ContactFormValues {
  email: string;
  phone: string;
  address: string;
}

interface BankFormValues {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  inSchoolContext,
  onBack,
  onSaveEmployee,
}) => {
  const [draft, setDraft] = useState<EmployeeNode>(employee);
  const [isEditingPersonal, setIsEditingPersonal] = useState<boolean>(false);
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [isEditingBank, setIsEditingBank] = useState<boolean>(false);

  const personalForm = useForm<PersonalFormValues>({
    defaultValues: {
      fullName: employee.fullName,
      dateOfBirth: employee.dateOfBirth,
      jobTitle: employee.jobTitle,
    },
  });

  const contactForm = useForm<ContactFormValues>({
    defaultValues: {
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
    },
  });

  const bankForm = useForm<BankFormValues>({
    defaultValues: {
      bankName: employee.bankName,
      accountName: employee.accountName,
      accountNumber: employee.accountNumber,
    },
  });

  useEffect(() => {
    setDraft(employee);
    personalForm.reset({
      fullName: employee.fullName,
      dateOfBirth: employee.dateOfBirth,
      jobTitle: employee.jobTitle,
    });
    contactForm.reset({
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
    });
    bankForm.reset({
      bankName: employee.bankName,
      accountName: employee.accountName,
      accountNumber: employee.accountNumber,
    });
  }, [bankForm, contactForm, employee, personalForm]);

  const commit = (next: EmployeeNode, message: string): void => {
    setDraft(next);
    onSaveEmployee(next);
    toast.success(message);
  };

  const savePersonal = (): void => {
    const values = personalForm.getValues();
    commit({ ...draft, ...values }, 'Personal section saved.');
    setIsEditingPersonal(false);
  };

  const saveContact = (): void => {
    const values = contactForm.getValues();
    commit({ ...draft, ...values }, 'Contact section saved.');
    setIsEditingContact(false);
  };

  const saveBank = (): void => {
    const values = bankForm.getValues();
    commit({ ...draft, ...values }, 'Bank section saved.');
    setIsEditingBank(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-bold">{draft.fullName}</h2>
          <p className="text-sm text-muted-foreground">{draft.jobTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Personal</CardTitle>
              <CardDescription>Identity and role details</CardDescription>
            </div>
            {!isEditingPersonal ? (
              <Button size="icon-sm" variant="ghost" onClick={() => setIsEditingPersonal(true)}><Pencil className="h-4 w-4" /></Button>
            ) : (
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={savePersonal}><Save className="h-4 w-4" /></Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    personalForm.reset({
                      fullName: draft.fullName,
                      dateOfBirth: draft.dateOfBirth,
                      jobTitle: draft.jobTitle,
                    });
                    setIsEditingPersonal(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingPersonal ? (
              <>
                <Input {...personalForm.register('fullName')} />
                <Input type="date" {...personalForm.register('dateOfBirth')} />
                <Input {...personalForm.register('jobTitle')} />
              </>
            ) : (
              <>
                <p><span className="font-medium">Name:</span> {draft.fullName}</p>
                <p><span className="font-medium">DOB:</span> {draft.dateOfBirth}</p>
                <p><span className="font-medium">Role:</span> {draft.role}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Reachability information</CardDescription>
            </div>
            {!isEditingContact ? (
              <Button size="icon-sm" variant="ghost" onClick={() => setIsEditingContact(true)}><Pencil className="h-4 w-4" /></Button>
            ) : (
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={saveContact}><Save className="h-4 w-4" /></Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    contactForm.reset({
                      email: draft.email,
                      phone: draft.phone,
                      address: draft.address,
                    });
                    setIsEditingContact(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingContact ? (
              <>
                <Input {...contactForm.register('email')} />
                <Input {...contactForm.register('phone')} />
                <Input {...contactForm.register('address')} />
              </>
            ) : (
              <>
                <p><span className="font-medium">Email:</span> {draft.email}</p>
                <p><span className="font-medium">Phone:</span> {draft.phone}</p>
                <p><span className="font-medium">Address:</span> {draft.address}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Bank</CardTitle>
              <CardDescription>Payroll disbursement details</CardDescription>
            </div>
            {!isEditingBank ? (
              <Button size="icon-sm" variant="ghost" onClick={() => setIsEditingBank(true)}><Pencil className="h-4 w-4" /></Button>
            ) : (
              <div className="flex gap-1">
                <Button size="icon-sm" variant="ghost" onClick={saveBank}><Save className="h-4 w-4" /></Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    bankForm.reset({
                      bankName: draft.bankName,
                      accountName: draft.accountName,
                      accountNumber: draft.accountNumber,
                    });
                    setIsEditingBank(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingBank ? (
              <>
                <Input {...bankForm.register('bankName')} />
                <Input {...bankForm.register('accountName')} />
                <Input {...bankForm.register('accountNumber')} />
              </>
            ) : (
              <>
                <p><span className="font-medium">Bank:</span> {draft.bankName}</p>
                <p><span className="font-medium">Account Name:</span> {draft.accountName}</p>
                <p><span className="font-medium">Account Number:</span> {draft.accountNumber}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Credits</CardTitle>
            <CardDescription>Recent leave requests</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {draft.leaveCredits.map((leave) => (
              <div key={leave.id} className="rounded-md border p-3">
                <p className="font-medium">{leave.type}</p>
                <p className="text-xs text-muted-foreground">{leave.date}</p>
                <Badge variant="outline" className="mt-2">{leave.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {inSchoolContext ? (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Study Loads</CardTitle>
              <CardDescription>Visible only when employee belongs to a school context.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {draft.studyLoads.map((load) => (
                <div key={load.id} className="rounded-md border p-3">
                  <p className="font-medium">{load.subject}</p>
                  <p className="text-sm text-muted-foreground">{load.schedule}</p>
                  <p className="text-xs text-muted-foreground">{load.units} units</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default EmployeeDetail;
