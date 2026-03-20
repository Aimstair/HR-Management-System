import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import type {
  AssignShiftPayload,
  ShiftEmployee,
  ShiftGroup,
  ShiftTemplate,
} from '../types';
import { getDaysIncludedLabel, getShiftLabel } from '../utils';

interface AssignShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: ShiftEmployee[];
  shiftGroups: ShiftGroup[];
  shifts: ShiftTemplate[];
  onApply: (payload: AssignShiftPayload) => void;
}

const AssignShiftDialog: React.FC<AssignShiftDialogProps> = ({
  open,
  onOpenChange,
  employees,
  shiftGroups,
  shifts,
  onApply,
}) => {
  const [employeeQuery, setEmployeeQuery] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(shiftGroups[0]?.id || '');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [assignType, setAssignType] = useState<'default' | 'date-range'>('default');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredEmployees = useMemo(() => {
    const normalized = employeeQuery.trim().toLowerCase();
    if (!normalized) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(normalized) ||
        employee.position.toLowerCase().includes(normalized),
    );
  }, [employees, employeeQuery]);

  const shiftsByGroup = useMemo(
    () => shifts.filter((shift) => shift.groupId === selectedGroupId),
    [shifts, selectedGroupId],
  );

  React.useEffect(() => {
    if (!shiftsByGroup.find((shift) => shift.id === selectedShiftId)) {
      setSelectedShiftId(shiftsByGroup[0]?.id || '');
    }
  }, [shiftsByGroup, selectedShiftId]);

  React.useEffect(() => {
    if (!open) {
      setEmployeeQuery('');
      setSelectedEmployeeIds([]);
      setAssignType('default');
      setStartDate('');
      setEndDate('');
      setSelectedGroupId(shiftGroups[0]?.id || '');
      setSelectedShiftId('');
    }
  }, [open, shiftGroups]);

  const selectedEmployees = useMemo(
    () => employees.filter((employee) => selectedEmployeeIds.includes(employee.id)),
    [employees, selectedEmployeeIds],
  );

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift.id === selectedShiftId) || null,
    [shifts, selectedShiftId],
  );

  const toggleEmployee = (employeeId: string): void => {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId],
    );
  };

  const onSelectAll = (): void => {
    setSelectedEmployeeIds(employees.map((employee) => employee.id));
  };

  const onClearAll = (): void => {
    setSelectedEmployeeIds([]);
  };

  const initials = (fullName: string): string =>
    fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const submit = (): void => {
    if (selectedEmployeeIds.length === 0 || !selectedGroupId || !selectedShiftId) {
      return;
    }

    onApply({
      employeeIds: selectedEmployeeIds,
      shiftGroupId: selectedGroupId,
      shiftId: selectedShiftId,
      type: assignType,
      startDate: assignType === 'date-range' ? startDate : undefined,
      endDate: assignType === 'date-range' ? endDate : undefined,
    });
  };

  const isInvalidDateRange = assignType === 'date-range' && (!startDate || !endDate || endDate < startDate);
  const disableSubmit =
    selectedEmployeeIds.length === 0 ||
    !selectedGroupId ||
    !selectedShiftId ||
    isInvalidDateRange;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Shift</DialogTitle>
          <DialogDescription>
            Assign or overwrite shift assignments for selected employees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employees</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">
                    {selectedEmployeeIds.length > 0
                      ? `${selectedEmployeeIds.length} employee(s) selected`
                      : 'Select employees'}
                  </span>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-105 p-3" align="start">
                <div className="space-y-2">
                  <Input
                    placeholder="Search employee"
                    value={employeeQuery}
                    onChange={(event) => setEmployeeQuery(event.target.value)}
                  />

                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={onSelectAll}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClearAll}>
                      Clear All
                    </Button>
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-md border">
                    {filteredEmployees.map((employee) => {
                      const isSelected = selectedEmployeeIds.includes(employee.id);

                      return (
                        <button
                          key={employee.id}
                          type="button"
                          className="flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                          onClick={() => toggleEmployee(employee.id)}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded border">
                            {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                          </div>

                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.avatarUrl} alt={employee.fullName} />
                            <AvatarFallback>{initials(employee.fullName)}</AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{employee.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedEmployees.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-md border p-2">
                {selectedEmployees.map((employee) => (
                  <Badge key={employee.id} variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {employee.fullName}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Shift Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift group" />
                </SelectTrigger>
                <SelectContent>
                  {shiftGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.daysPerYear} days/year)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shiftsByGroup.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} | {getShiftLabel(shift)} | {getDaysIncludedLabel(shift.daysIncluded)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={assignType} onValueChange={(value: 'default' | 'date-range') => setAssignType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Set as Default Shift</SelectItem>
                <SelectItem value="date-range">Select Date Range for specified shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignType === 'date-range' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p>
              Selected Shift: {selectedShift ? `${selectedShift.name} (${getShiftLabel(selectedShift)})` : 'None'}
            </p>
            {assignType === 'date-range' ? (
              <p>
                Applied Date Range: {startDate || '-'} to {endDate || '-'}
              </p>
            ) : (
              <p>Applied as employee default shift.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={disableSubmit}>
            Assign Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignShiftDialog;
