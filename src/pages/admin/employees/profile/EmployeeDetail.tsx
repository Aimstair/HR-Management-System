import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
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
import { Label } from '../../../../../components/ui/label';
import { Checkbox } from '../../../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Badge } from '../../../../../components/ui/badge';
import type { BankAccount, EmployeeNode } from '../types';

interface EmployeeDetailProps {
  employee: EmployeeNode;
  inSchoolContext: boolean;
  onBack: () => void;
  onSaveEmployee: (employee: EmployeeNode) => void;
}

const DEFAULT_TEMP_PASSWORD = 'Welcome123!';

const schoolOptions = ['School of Engineering', 'School of Law', 'School of Computer Studies', 'N/A'];
const departmentOptions = ['Teaching Faculties', 'HR', 'Accounting', 'Maintenance', 'Operations'];

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  inSchoolContext,
  onBack,
  onSaveEmployee,
}) => {
  const [draft, setDraft] = useState<EmployeeNode>(employee);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    setDraft(employee);
    setIsEditing(false);
    setShowPassword(false);
  }, [employee]);

  const fullName = useMemo(() => {
    return [draft.firstName, draft.middleName, draft.lastName].filter(Boolean).join(' ').trim() || draft.fullName;
  }, [draft.firstName, draft.lastName, draft.middleName, draft.fullName]);

  const updateDraft = <K extends keyof EmployeeNode>(key: K, value: EmployeeNode[K]): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateBankAccount = (index: number, patch: Partial<BankAccount>): void => {
    setDraft((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.map((account, accountIndex) =>
        accountIndex === index ? { ...account, ...patch } : account,
      ),
    }));
  };

  const addBankAccount = (): void => {
    setDraft((current) => ({
      ...current,
      bankAccounts: [
        ...current.bankAccounts,
        {
          id: `BA-${Date.now()}`,
          bankName: '',
          accountNo: '',
        },
      ],
    }));
  };

  const removeBankAccount = (index: number): void => {
    setDraft((current) => {
      if (current.bankAccounts.length === 1) {
        return current;
      }
      return {
        ...current,
        bankAccounts: current.bankAccounts.filter((_, accountIndex) => accountIndex !== index),
      };
    });
  };

  const save = (): void => {
    const normalized: EmployeeNode = {
      ...draft,
      fullName,
      jobTitle: draft.position,
      dateOfBirth: draft.birthDate,
      phone: draft.phoneNumber,
      address: draft.presentAddress,
      avatarUrl: draft.profilePicture || draft.avatarUrl,
      email: draft.email,
      bankName: draft.bankAccounts[0]?.bankName || draft.bankName,
      accountName: fullName,
      accountNumber: draft.bankAccounts[0]?.accountNo || draft.accountNumber,
    };

    setDraft(normalized);
    onSaveEmployee(normalized);
    setIsEditing(false);
    toast.success('Employee profile updated.');
  };

  const cancel = (): void => {
    setDraft(employee);
    setIsEditing(false);
    setShowPassword(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit Details
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={cancel}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={save}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <img
          src={draft.profilePicture || draft.avatarUrl || `https://picsum.photos/seed/${draft.id}/120/120`}
          alt={fullName}
          className="h-16 w-16 rounded-full border object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{draft.position}</p>
        </div>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Identity and addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1"><Label>First Name</Label><Input disabled={!isEditing} value={draft.firstName} onChange={(event) => updateDraft('firstName', event.target.value)} /></div>
              <div className="space-y-1"><Label>Middle Name</Label><Input disabled={!isEditing} value={draft.middleName} onChange={(event) => updateDraft('middleName', event.target.value)} /></div>
              <div className="space-y-1"><Label>Last Name</Label><Input disabled={!isEditing} value={draft.lastName} onChange={(event) => updateDraft('lastName', event.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Birth Date</Label><Input type="date" disabled={!isEditing} value={draft.birthDate} onChange={(event) => updateDraft('birthDate', event.target.value)} /></div>
              <div className="space-y-1"><Label>Phone Number</Label><Input disabled={!isEditing} value={draft.phoneNumber} onChange={(event) => updateDraft('phoneNumber', event.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Present Address</Label><Input disabled={!isEditing} value={draft.presentAddress} onChange={(event) => updateDraft('presentAddress', event.target.value)} /></div>
              <div className="space-y-1"><Label>Present Zip Code</Label><Input disabled={!isEditing} value={draft.presentAddressZipCode} onChange={(event) => updateDraft('presentAddressZipCode', event.target.value)} /></div>
              <div className="space-y-1"><Label>Permanent Address</Label><Input disabled={!isEditing} value={draft.permanentAddress} onChange={(event) => updateDraft('permanentAddress', event.target.value)} /></div>
              <div className="space-y-1"><Label>Permanent Zip Code</Label><Input disabled={!isEditing} value={draft.permanentAddressZipCode} onChange={(event) => updateDraft('permanentAddressZipCode', event.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Account Credentials</CardTitle>
            <CardDescription>Login and temporary password controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Username</Label><Input disabled={!isEditing} value={draft.username} onChange={(event) => updateDraft('username', event.target.value)} /></div>
            <div className="space-y-1"><Label>Email</Label><Input disabled={!isEditing} value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} /></div>
            <div className="space-y-1">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  disabled={!isEditing}
                  value={draft.temporaryPassword}
                  onChange={(event) => updateDraft('temporaryPassword', event.target.value)}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isEditing}
                  onClick={() => {
                    updateDraft('temporaryPassword', DEFAULT_TEMP_PASSWORD);
                    toast.success('Temporary password reset to default.');
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Government IDs and employment metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>ID Number</Label><Input disabled={!isEditing} value={draft.idNumber} onChange={(event) => updateDraft('idNumber', event.target.value)} /></div>
              <div className="space-y-1"><Label>Position</Label><Input disabled={!isEditing} value={draft.position} onChange={(event) => updateDraft('position', event.target.value)} /></div>
              <div className="space-y-1"><Label>Date Hired</Label><Input type="date" disabled={!isEditing} value={draft.dateHired} onChange={(event) => updateDraft('dateHired', event.target.value)} /></div>
              <div className="space-y-1"><Label>SSS ID</Label><Input disabled={!isEditing} value={draft.sssId} onChange={(event) => updateDraft('sssId', event.target.value)} /></div>
              <div className="space-y-1"><Label>Pag-IBIG ID</Label><Input disabled={!isEditing} value={draft.pagIbigId} onChange={(event) => updateDraft('pagIbigId', event.target.value)} /></div>
              <div className="space-y-1"><Label>TIN No</Label><Input disabled={!isEditing} value={draft.tinNo} onChange={(event) => updateDraft('tinNo', event.target.value)} /></div>
              <div className="space-y-1"><Label>PhilHealth No</Label><Input disabled={!isEditing} value={draft.philhealthNo} onChange={(event) => updateDraft('philhealthNo', event.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teams & Department</CardTitle>
            <CardDescription>Placement assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>School</Label>
              <Select value={draft.schoolName || 'N/A'} onValueChange={(value) => updateDraft('schoolName', value)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <Select value={draft.departmentName || 'HR'} onValueChange={(value) => updateDraft('departmentName', value)} disabled={!isEditing}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {inSchoolContext ? <Badge variant="outline">School context enabled</Badge> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Privileges</CardTitle>
            <CardDescription>Payroll and attendance exemptions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ['noLate', 'No Late'],
              ['noOvertime', 'No Overtime'],
              ['noNightDifferentialPay', 'No Night Differential Pay'],
              ['noMinimumHours', 'No Minimum Hours'],
              ['noHolidayPay', 'No Holiday Pay'],
              ['noPremiumOnOvertime', 'No Premium on Overtime'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  disabled={!isEditing}
                  checked={draft.privileges[key as keyof EmployeeNode['privileges']]}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      privileges: {
                        ...current.privileges,
                        [key]: Boolean(checked),
                      },
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Multiple bank accounts</CardDescription>
            </div>
            {isEditing ? (
              <Button type="button" size="sm" variant="outline" onClick={addBankAccount}>
                <Plus className="h-4 w-4" />
                Add Bank
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.bankAccounts.map((account, index) => (
              <div key={account.id} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  disabled={!isEditing}
                  value={account.bankName}
                  onChange={(event) => updateBankAccount(index, { bankName: event.target.value })}
                  placeholder="Bank name"
                />
                <Input
                  disabled={!isEditing}
                  value={account.accountNo}
                  onChange={(event) => updateBankAccount(index, { accountNo: event.target.value })}
                  placeholder="Account number"
                />
                {isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeBankAccount(index)}
                    disabled={draft.bankAccounts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="space-y-3">
          <CardHeader>
            <CardTitle>Fund Request</CardTitle>
            <CardDescription>Fund controls and pending request policy</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Fund Request Limit</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={draft.fundRequestLimit}
                onChange={(event) => updateDraft('fundRequestLimit', Number(event.target.value) || 0)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm md:mt-7">
              <Checkbox
                disabled={!isEditing}
                checked={draft.allowManyPendingFundRequests}
                onCheckedChange={(checked) => updateDraft('allowManyPendingFundRequests', Boolean(checked))}
              />
              <span>Allow Many Pending Fund Requests</span>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetail;
