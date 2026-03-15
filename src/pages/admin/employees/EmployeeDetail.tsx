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
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import type { EmployeeProfile } from './index';

interface EmployeeDetailProps {
  employee: EmployeeProfile;
  onBack: () => void;
  onUpdate: (employee: EmployeeProfile) => void;
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

const SectionActions: React.FC<{
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}> = ({ isEditing, onEdit, onCancel, onSave }) => {
  if (!isEditing) {
    return (
      <Button size="icon-sm" variant="ghost" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button size="icon-sm" variant="ghost" onClick={onSave}>
        <Save className="h-4 w-4" />
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack, onUpdate }) => {
  const [draft, setDraft] = useState<EmployeeProfile>(employee);

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

  const savePersonal = (): void => {
    const values = personalForm.getValues();
    const updated = { ...draft, ...values };
    setDraft(updated);
    onUpdate(updated);
    setIsEditingPersonal(false);
    toast.success('Personal information updated.');
  };

  const saveContact = (): void => {
    const values = contactForm.getValues();
    const updated = { ...draft, ...values };
    setDraft(updated);
    onUpdate(updated);
    setIsEditingContact(false);
    toast.success('Contact information updated.');
  };

  const saveBank = (): void => {
    const values = bankForm.getValues();
    const updated = { ...draft, ...values };
    setDraft(updated);
    onUpdate(updated);
    setIsEditingBank(false);
    toast.success('Bank details updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">{draft.fullName}</h1>
          <p className="text-sm text-muted-foreground">{draft.jobTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Personal Info</CardTitle>
              <CardDescription>Core profile details</CardDescription>
            </div>
            <SectionActions
              isEditing={isEditingPersonal}
              onEdit={() => setIsEditingPersonal(true)}
              onCancel={() => {
                personalForm.reset({
                  fullName: draft.fullName,
                  dateOfBirth: draft.dateOfBirth,
                  jobTitle: draft.jobTitle,
                });
                setIsEditingPersonal(false);
              }}
              onSave={savePersonal}
            />
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
              <CardTitle>Contact Info</CardTitle>
              <CardDescription>Communication channels</CardDescription>
            </div>
            <SectionActions
              isEditing={isEditingContact}
              onEdit={() => setIsEditingContact(true)}
              onCancel={() => {
                contactForm.reset({
                  email: draft.email,
                  phone: draft.phone,
                  address: draft.address,
                });
                setIsEditingContact(false);
              }}
              onSave={saveContact}
            />
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
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Payroll account information</CardDescription>
            </div>
            <SectionActions
              isEditing={isEditingBank}
              onEdit={() => setIsEditingBank(true)}
              onCancel={() => {
                bankForm.reset({
                  bankName: draft.bankName,
                  accountName: draft.accountName,
                  accountNumber: draft.accountNumber,
                });
                setIsEditingBank(false);
              }}
              onSave={saveBank}
            />
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
            <CardDescription>Recent leave request activity</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {draft.leaveCredits.map((leave) => (
              <div key={leave.id} className="rounded-md border p-3">
                <p className="font-medium">{leave.type}</p>
                <p className="text-xs text-muted-foreground">{leave.date}</p>
                <Badge className="mt-2" variant="outline">{leave.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {draft.role === 'Faculty' ? (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Study Loads</CardTitle>
              <CardDescription>Visible for faculty profiles only</CardDescription>
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
