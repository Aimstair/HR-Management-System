import React from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { UserRole, type User } from '../../types';
import { campuses as employeeDirectoryCampuses } from '../admin/employees/mockData';
import type { CampusNode, EmployeeNode } from '../admin/employees/types';

const EMPTY_VALUE = 'N/A';

const privilegeLabels: Array<{ key: keyof EmployeeNode['privileges']; label: string }> = [
  { key: 'noLate', label: 'No Late' },
  { key: 'noOvertime', label: 'No Overtime' },
  { key: 'noNightDifferentialPay', label: 'No Night Differential Pay' },
  { key: 'noMinimumHours', label: 'No Minimum Hours' },
  { key: 'noHolidayPay', label: 'No Holiday Pay' },
  { key: 'noPremiumOnOvertime', label: 'No Premium on Overtime' },
];

const collectEmployees = (campuses: CampusNode[]): EmployeeNode[] => {
  return campuses.flatMap((campus) =>
    campus.departments.flatMap((department) => {
      const directEmployees = department.employees ?? [];
      const schoolEmployees = (department.schools ?? []).flatMap((school) => school.employees);
      return [...directEmployees, ...schoolEmployees];
    }),
  );
};

const directoryEmployees = collectEmployees(employeeDirectoryCampuses);

type SectionKey =
  | 'personal'
  | 'account'
  | 'employment'
  | 'teams'
  | 'privileges'
  | 'bank'
  | 'fund';

const toDisplay = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return EMPTY_VALUE;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : EMPTY_VALUE;
};

const toEditableText = (value: string): string => {
  return value === EMPTY_VALUE ? '' : value;
};

const toDateInputValue = (value: string): string => {
  if (!value || value === EMPTY_VALUE) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string): string => {
  if (!value || value === EMPTY_VALUE) {
    return EMPTY_VALUE;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
};

const toInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const buildFallbackEmployee = (user: User): EmployeeNode => {
  const fullName = `${user.firstName} ${user.lastName}`;

  return {
    id: user.id,
    fullName,
    firstName: user.firstName,
    middleName: '',
    lastName: user.lastName,
    jobTitle: user.position,
    role: user.role === UserRole.HR ? 'HR Admin' : 'Faculty',
    profilePicture: user.profileImage,
    birthDate: EMPTY_VALUE,
    phoneNumber: EMPTY_VALUE,
    presentAddress: EMPTY_VALUE,
    presentAddressZipCode: EMPTY_VALUE,
    permanentAddress: EMPTY_VALUE,
    permanentAddressZipCode: EMPTY_VALUE,
    username: user.email.split('@')[0],
    temporaryPassword: EMPTY_VALUE,
    idNumber: EMPTY_VALUE,
    position: user.position,
    dateHired: user.joinDate.toISOString().slice(0, 10),
    sssId: EMPTY_VALUE,
    pagIbigId: EMPTY_VALUE,
    tinNo: EMPTY_VALUE,
    philhealthNo: EMPTY_VALUE,
    schoolName: user.schoolBranch,
    departmentName: user.department,
    privileges: {
      noLate: false,
      noOvertime: false,
      noNightDifferentialPay: false,
      noMinimumHours: false,
      noHolidayPay: false,
      noPremiumOnOvertime: false,
    },
    bankAccounts: [{ id: `${user.id}-BA1`, bankName: EMPTY_VALUE, accountNo: EMPTY_VALUE }],
    fundRequestLimit: 0,
    allowManyPendingFundRequests: false,
    email: user.email,
    phone: EMPTY_VALUE,
    status: 'Active',
    avatarUrl: user.profileImage,
    dateOfBirth: EMPTY_VALUE,
    address: EMPTY_VALUE,
    bankName: EMPTY_VALUE,
    accountName: fullName,
    accountNumber: EMPTY_VALUE,
    leaveCredits: [],
    studyLoads: [],
  };
};

const resolveProfile = (user: User | null): EmployeeNode | null => {
  if (!user) {
    return null;
  }

  const byEmail = directoryEmployees.find(
    (employee) => employee.email.toLowerCase() === user.email.toLowerCase(),
  );
  if (byEmail) {
    return byEmail;
  }

  const first = user.firstName.toLowerCase();
  const last = user.lastName.toLowerCase();
  const byName = directoryEmployees.find((employee) => {
    const fullName = employee.fullName.toLowerCase();
    return fullName.includes(first) && fullName.includes(last);
  });

  return byName ?? buildFallbackEmployee(user);
};

const cloneProfile = (profile: EmployeeNode): EmployeeNode => ({
  ...profile,
  privileges: { ...profile.privileges },
  bankAccounts: profile.bankAccounts.map((account) => ({ ...account })),
  leaveCredits: [...profile.leaveCredits],
  studyLoads: [...profile.studyLoads],
});

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();

  const profile = React.useMemo(() => {
    return resolveProfile(user);
  }, [user]);

  const [draftProfile, setDraftProfile] = React.useState<EmployeeNode | null>(null);
  const [editingSection, setEditingSection] = React.useState<SectionKey | null>(null);

  React.useEffect(() => {
    if (!profile) {
      setDraftProfile(null);
      setEditingSection(null);
      return;
    }

    setDraftProfile(cloneProfile(profile));
    setEditingSection(null);
  }, [profile]);

  const isEditing = (section: SectionKey): boolean => editingSection === section;

  const startEditing = (section: SectionKey): void => {
    setEditingSection(section);
  };

  const cancelEditing = (): void => {
    if (profile) {
      setDraftProfile(cloneProfile(profile));
    }
    setEditingSection(null);
  };

  const saveEditing = (sectionLabel: string): void => {
    setEditingSection(null);
    toast.success(`${sectionLabel} saved.`);
  };

  const updateField = <K extends keyof EmployeeNode>(
    key: K,
    value: EmployeeNode[K],
  ): void => {
    setDraftProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  };

  const updatePrivilege = (
    key: keyof EmployeeNode['privileges'],
    value: boolean,
  ): void => {
    setDraftProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        privileges: {
          ...current.privileges,
          [key]: value,
        },
      };
    });
  };

  const updateBankAccount = (
    accountId: string,
    key: 'bankName' | 'accountNo',
    value: string,
  ): void => {
    setDraftProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        bankAccounts: current.bankAccounts.map((account) =>
          account.id === accountId
            ? {
                ...account,
                [key]: value,
              }
            : account,
        ),
      };
    });
  };

  const renderCardAction = (section: SectionKey, sectionLabel: string): React.ReactNode => {
    if (isEditing(section)) {
      return (
        <CardAction className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={() => saveEditing(sectionLabel)}>
            Save
          </Button>
        </CardAction>
      );
    }

    return (
      <CardAction>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label={`Edit ${sectionLabel}`}
          onClick={() => startEditing(section)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardAction>
    );
  };

  if (!profile || !draftProfile) {
    return (
      <Card className="py-4">
        <CardContent>
          <p className="text-sm text-muted-foreground">No profile data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={draftProfile.profilePicture || draftProfile.avatarUrl || `https://picsum.photos/seed/${draftProfile.id}/120/120`}
            alt={draftProfile.fullName}
          />
          <AvatarFallback>{toInitials(draftProfile.fullName)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-bold">{draftProfile.fullName}</h2>
          <p className="text-sm text-muted-foreground">{toDisplay(draftProfile.position)}</p>
          <p className="text-xs text-muted-foreground">ID Number: {toDisplay(draftProfile.idNumber)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Identity and addresses</CardDescription>
          {renderCardAction('personal', 'Personal Information')}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">First Name</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.firstName)}
                  onChange={(event) => updateField('firstName', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.firstName)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Middle Name</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.middleName)}
                  onChange={(event) => updateField('middleName', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.middleName)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Name</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.lastName)}
                  onChange={(event) => updateField('lastName', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.lastName)}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Birth Date</p>
              {isEditing('personal') ? (
                <Input
                  type="date"
                  value={toDateInputValue(draftProfile.birthDate)}
                  onChange={(event) => updateField('birthDate', event.target.value)}
                />
              ) : (
                <p>{formatDate(draftProfile.birthDate)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone Number</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.phoneNumber)}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.phoneNumber)}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Present Address</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.presentAddress)}
                  onChange={(event) => updateField('presentAddress', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.presentAddress)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Present Zip Code</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.presentAddressZipCode)}
                  onChange={(event) => updateField('presentAddressZipCode', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.presentAddressZipCode)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Permanent Address</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.permanentAddress)}
                  onChange={(event) => updateField('permanentAddress', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.permanentAddress)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Permanent Zip Code</p>
              {isEditing('personal') ? (
                <Input
                  value={toEditableText(draftProfile.permanentAddressZipCode)}
                  onChange={(event) => updateField('permanentAddressZipCode', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.permanentAddressZipCode)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Credentials</CardTitle>
            <CardDescription>Login and temporary password controls</CardDescription>
            {renderCardAction('account', 'Account Credentials')}
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              {isEditing('account') ? (
                <Input
                  value={toEditableText(draftProfile.username)}
                  onChange={(event) => updateField('username', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.username)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              {isEditing('account') ? (
                <Input
                  type="email"
                  value={toEditableText(draftProfile.email)}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.email)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temporary Password</p>
              {isEditing('account') ? (
                <Input
                  value={toEditableText(draftProfile.temporaryPassword)}
                  onChange={(event) => updateField('temporaryPassword', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.temporaryPassword)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Government IDs and employment metadata</CardDescription>
            {renderCardAction('employment', 'Employment Details')}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">ID Number</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.idNumber)}
                  onChange={(event) => updateField('idNumber', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.idNumber)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Position</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.position)}
                  onChange={(event) => updateField('position', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.position)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date Hired</p>
              {isEditing('employment') ? (
                <Input
                  type="date"
                  value={toDateInputValue(draftProfile.dateHired)}
                  onChange={(event) => updateField('dateHired', event.target.value)}
                />
              ) : (
                <p>{formatDate(draftProfile.dateHired)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SSS ID</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.sssId)}
                  onChange={(event) => updateField('sssId', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.sssId)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pag-IBIG ID</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.pagIbigId)}
                  onChange={(event) => updateField('pagIbigId', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.pagIbigId)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TIN No</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.tinNo)}
                  onChange={(event) => updateField('tinNo', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.tinNo)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">PhilHealth No</p>
              {isEditing('employment') ? (
                <Input
                  value={toEditableText(draftProfile.philhealthNo)}
                  onChange={(event) => updateField('philhealthNo', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.philhealthNo)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teams & Department</CardTitle>
            <CardDescription>Placement assignment</CardDescription>
            {renderCardAction('teams', 'Teams & Department')}
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">School</p>
              {isEditing('teams') ? (
                <Input
                  value={toEditableText(draftProfile.schoolName)}
                  onChange={(event) => updateField('schoolName', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.schoolName)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              {isEditing('teams') ? (
                <Input
                  value={toEditableText(draftProfile.departmentName)}
                  onChange={(event) => updateField('departmentName', event.target.value)}
                />
              ) : (
                <p>{toDisplay(draftProfile.departmentName)}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {isEditing('teams') ? (
                <>
                  <div className="w-full max-w-60">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Select
                      value={draftProfile.role}
                      onValueChange={(value) => updateField('role', value as EmployeeNode['role'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Faculty">Faculty</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Chairman">Chairman</SelectItem>
                        <SelectItem value="Dean">Dean</SelectItem>
                        <SelectItem value="HR Admin">HR Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full max-w-60">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select
                      value={draftProfile.status}
                      onValueChange={(value) => updateField('status', value as EmployeeNode['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="outline">Role: {toDisplay(draftProfile.role)}</Badge>
                  <Badge variant="outline">Status: {toDisplay(draftProfile.status)}</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Privileges</CardTitle>
            <CardDescription>Payroll and attendance exemptions</CardDescription>
            {renderCardAction('privileges', 'Employee Privileges')}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {privilegeLabels.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-sm border p-2 text-sm">
                <span>{label}</span>
                {isEditing('privileges') ? (
                  <Checkbox
                    checked={draftProfile.privileges[key]}
                    onCheckedChange={(nextValue) => updatePrivilege(key, Boolean(nextValue))}
                  />
                ) : (
                  <Badge variant={draftProfile.privileges[key] ? 'default' : 'secondary'}>
                    {draftProfile.privileges[key] ? 'Enabled' : 'Disabled'}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>Multiple bank accounts</CardDescription>
            {renderCardAction('bank', 'Bank Details')}
          </CardHeader>
          <CardContent className="space-y-2">
            {draftProfile.bankAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bank accounts listed.</p>
            ) : (
              draftProfile.bankAccounts.map((account) => (
                <div key={account.id} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Bank Name</p>
                    {isEditing('bank') ? (
                      <Input
                        value={toEditableText(account.bankName)}
                        onChange={(event) => updateBankAccount(account.id, 'bankName', event.target.value)}
                      />
                    ) : (
                      <p>{toDisplay(account.bankName)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    {isEditing('bank') ? (
                      <Input
                        value={toEditableText(account.accountNo)}
                        onChange={(event) => updateBankAccount(account.id, 'accountNo', event.target.value)}
                      />
                    ) : (
                      <p>{toDisplay(account.accountNo)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fund Request</CardTitle>
            <CardDescription>Fund controls and pending request policy</CardDescription>
            {renderCardAction('fund', 'Fund Request')}
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Fund Request Limit</p>
              {isEditing('fund') ? (
                <Input
                  type="number"
                  min={0}
                  value={draftProfile.fundRequestLimit}
                  onChange={(event) => {
                    const nextValue = Number.parseInt(event.target.value, 10);
                    updateField('fundRequestLimit', Number.isNaN(nextValue) ? 0 : nextValue);
                  }}
                />
              ) : (
                <p>{toDisplay(draftProfile.fundRequestLimit)}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Allow Many Pending Fund Requests</p>
              {isEditing('fund') ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={draftProfile.allowManyPendingFundRequests}
                    onCheckedChange={(nextValue) =>
                      updateField('allowManyPendingFundRequests', Boolean(nextValue))
                    }
                  />
                  <span className="text-sm">
                    {draftProfile.allowManyPendingFundRequests ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ) : (
                <Badge variant={draftProfile.allowManyPendingFundRequests ? 'default' : 'secondary'}>
                  {draftProfile.allowManyPendingFundRequests ? 'Yes' : 'No'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfile;
