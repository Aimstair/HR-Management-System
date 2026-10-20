import React, { useEffect, useMemo, useState } from 'react';
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
import { Label } from '../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Badge } from '../../../../../components/ui/badge';
import { updateAdminEmployee, type AdminEmployeeRecord } from '../../../../lib/admin-api';
import type { CampusNode, EmployeeNode } from '../types';

interface EmployeeDetailProps {
  employee: EmployeeNode;
  campuses: CampusNode[];
  onBack: () => void;
  onSaveEmployee: (employee: EmployeeNode) => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  campuses,
  onBack,
  onSaveEmployee,
}) => {
  const [draft, setDraft] = useState<EmployeeNode>(employee);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [teachingSchoolId, setTeachingSchoolId] = useState<string>('');
  const [teachingDepartmentId, setTeachingDepartmentId] = useState<string>('');

  useEffect(() => {
    setDraft(employee);
    setIsEditing(false);
  }, [employee]);

  const selectedCampus = useMemo(
    () => campuses.find((campus) => campus.id === draft.schoolId) ?? null,
    [campuses, draft.schoolId],
  );

  const campusDepartments = selectedCampus?.departments ?? [];
  const teachingDepartment = campusDepartments.find((department) => department.name === 'Teaching Faculties') ?? null;
  const teachingSchools = teachingDepartment?.schools ?? [];

  const nonTeachingDepartments = campusDepartments.filter(
    (department) => department.name !== 'Teaching Faculties',
  );

  useEffect(() => {
    if (!draft.employeeType || draft.employeeType === 'NON_TEACHING') {
      setTeachingSchoolId('');
      setTeachingDepartmentId('');
      return;
    }

    const fallbackSchool = teachingSchools[0]?.id ?? '';
    if (!teachingSchoolId) {
      setTeachingSchoolId(fallbackSchool);
    }

    const schoolMatch = teachingSchools.find((school) => school.departments?.some((department) => department.id === draft.departmentId));
    if (schoolMatch && schoolMatch.id !== teachingSchoolId) {
      setTeachingSchoolId(schoolMatch.id);
    }

    if (!teachingDepartmentId && schoolMatch?.departments?.[0]?.id) {
      setTeachingDepartmentId(schoolMatch.departments[0].id);
    }
  }, [draft.departmentId, draft.employeeType, teachingDepartmentId, teachingSchoolId, teachingSchools]);

  const selectedTeachingSchool = teachingSchools.find((school) => school.id === teachingSchoolId) ?? null;
  const teachingDepartments = selectedTeachingSchool?.departments ?? [];

  useEffect(() => {
    if (draft.employeeType === 'TEACHING' && teachingDepartments.length > 0) {
      if (!teachingDepartments.some((department) => department.id === teachingDepartmentId)) {
        setTeachingDepartmentId(teachingDepartments[0]?.id ?? '');
      }
    }
  }, [draft.employeeType, teachingDepartments, teachingDepartmentId]);

  const updateDraft = <K extends keyof EmployeeNode>(key: K, value: EmployeeNode[K]): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const toEmployeeNode = (employeeRecord: AdminEmployeeRecord): EmployeeNode => {
    return {
      id: employeeRecord.id,
      firstName: employeeRecord.firstName,
      lastName: employeeRecord.lastName,
      email: employeeRecord.email,
      employeeType: employeeRecord.employeeType,
      isActive: employeeRecord.isActive,
      status: employeeRecord.isActive ? 'Active' : 'Inactive',
      position: employeeRecord.position,
      profileImage: employeeRecord.profileImage,
      schoolId: employeeRecord.schoolId,
      schoolBranch: employeeRecord.schoolBranch,
      departmentId: employeeRecord.departmentId,
      department: employeeRecord.department,
      joinDate: employeeRecord.joinDate,
      idNumber: employeeRecord.idNumber,
      sssId: employeeRecord.sssId,
      pagIbigId: employeeRecord.pagIbigId,
      tinNo: employeeRecord.tinNo,
      philhealthNo: employeeRecord.philhealthNo,
    };
  };

  const save = async (): Promise<void> => {
    const departmentId = draft.employeeType === 'TEACHING' ? teachingDepartmentId : draft.departmentId;

    if (!draft.schoolId || !departmentId) {
      toast.error('Please select a valid campus and department.');
      return;
    }

    try {
      const response = await updateAdminEmployee(draft.id, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim().toLowerCase(),
        employeeType: draft.employeeType,
        position: draft.position?.trim() || null,
        isActive: draft.isActive,
        schoolId: draft.schoolId,
        departmentId,
        idNumber: draft.idNumber?.trim() || null,
        sssId: draft.sssId?.trim() || null,
        pagIbigId: draft.pagIbigId?.trim() || null,
        tinNo: draft.tinNo?.trim() || null,
        philhealthNo: draft.philhealthNo?.trim() || null,
      });

      const updated = toEmployeeNode(response.employee);
      onSaveEmployee(updated);
      setDraft(updated);
      setIsEditing(false);
      toast.success('Employee profile updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update employee.');
    }
  };

  const cancel = (): void => {
    setDraft(employee);
    setIsEditing(false);
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
          src={draft.profileImage || `https://picsum.photos/seed/${draft.id}/120/120`}
          alt={`${draft.firstName} ${draft.lastName}`}
          className="h-16 w-16 rounded-full border object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{draft.firstName} {draft.lastName}</h2>
          <p className="text-sm text-muted-foreground">{draft.position ?? 'Employee'}</p>
        </div>
        <Badge className={draft.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
          {draft.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
          <CardDescription>Update employee identity and placement data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input disabled={!isEditing} value={draft.firstName} onChange={(event) => updateDraft('firstName', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input disabled={!isEditing} value={draft.lastName} onChange={(event) => updateDraft('lastName', event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input disabled={!isEditing} value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input disabled={!isEditing} value={draft.position ?? ''} onChange={(event) => updateDraft('position', event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee Type</Label>
              <Select
                value={draft.employeeType}
                onValueChange={(value) => updateDraft('employeeType', value as EmployeeNode['employeeType'])}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHING">Teaching</SelectItem>
                  <SelectItem value="NON_TEACHING">Non-Teaching</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.isActive ? 'Active' : 'Inactive'}
                onValueChange={(value) => updateDraft('isActive', value === 'Active')}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select
                value={draft.schoolId ?? ''}
                onValueChange={(value) => updateDraft('schoolId', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select campus" /></SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {draft.employeeType === 'NON_TEACHING' ? (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={draft.departmentId ?? ''}
                  onValueChange={(value) => updateDraft('departmentId', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {nonTeachingDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>School</Label>
                <Select
                  value={teachingSchoolId}
                  onValueChange={(value) => setTeachingSchoolId(value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select school" /></SelectTrigger>
                  <SelectContent>
                    {teachingSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {draft.employeeType === 'TEACHING' ? (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={teachingDepartmentId}
                onValueChange={(value) => setTeachingDepartmentId(value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {teachingDepartments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Government Credentials</CardTitle>
          <CardDescription>Update employee identity and government numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input disabled={!isEditing} value={draft.idNumber ?? ''} onChange={(event) => updateDraft('idNumber', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SSS ID</Label>
              <Input disabled={!isEditing} value={draft.sssId ?? ''} onChange={(event) => updateDraft('sssId', event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Pag-IBIG ID</Label>
              <Input disabled={!isEditing} value={draft.pagIbigId ?? ''} onChange={(event) => updateDraft('pagIbigId', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>TIN No</Label>
              <Input disabled={!isEditing} value={draft.tinNo ?? ''} onChange={(event) => updateDraft('tinNo', event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>PhilHealth No</Label>
              <Input disabled={!isEditing} value={draft.philhealthNo ?? ''} onChange={(event) => updateDraft('philhealthNo', event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetail;
