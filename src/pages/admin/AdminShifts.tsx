import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import AssignShiftDialog from './shifts/components/AssignShiftDialog';
import ShiftAssignmentTable from './shifts/components/ShiftAssignmentTable';
import ShiftStatusLegend from './shifts/components/ShiftStatusLegend';
import WeekNavigator from './shifts/components/WeekNavigator';
import { createInitialOverrides, shiftEmployees, shiftGroups, shiftTemplates } from './shifts/mockData';
import type { AssignShiftPayload, ShiftEmployee, ShiftOverride } from './shifts/types';
import {
  buildWeekCells,
  enumerateDateRange,
  formatWeekRange,
  getWeekDates,
  getWeekday,
  toDateKey,
} from './shifts/utils';

const AdminShifts: React.FC = () => {
  const [employees, setEmployees] = useState<ShiftEmployee[]>(shiftEmployees);
  const [overrides, setOverrides] = useState<ShiftOverride[]>(createInitialOverrides());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekRange = useMemo(() => formatWeekRange(weekDates), [weekDates]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(query) || employee.position.toLowerCase().includes(query),
    );
  }, [employees, search]);

  const cellsByEmployee = useMemo(
    () => buildWeekCells(filteredEmployees, shiftTemplates, overrides, weekDates),
    [filteredEmployees, overrides, weekDates],
  );

  const applyShiftAssignment = (payload: AssignShiftPayload): void => {
    const shift = shiftTemplates.find((item) => item.id === payload.shiftId);
    if (!shift) {
      return;
    }

    if (payload.type === 'default') {
      setEmployees((current) =>
        current.map((employee) =>
          payload.employeeIds.includes(employee.id)
            ? { ...employee, defaultShiftId: payload.shiftId }
            : employee,
        ),
      );

      toast.success(`Default shift ${shift.name} assigned to ${payload.employeeIds.length} employee(s).`);
      setIsDialogOpen(false);
      return;
    }

    if (!payload.startDate || !payload.endDate) {
      return;
    }

    const rangeDates = enumerateDateRange(payload.startDate, payload.endDate);
    if (rangeDates.length === 0) {
      return;
    }

    setOverrides((current) => {
      const next = new Map(current.map((item) => [`${item.employeeId}|${item.date}`, item]));

      payload.employeeIds.forEach((employeeId) => {
        rangeDates.forEach((dateKey) => {
          const weekday = getWeekday(new Date(`${dateKey}T00:00:00`));
          if (!shift.daysIncluded.includes(weekday)) {
            return;
          }

          next.set(`${employeeId}|${dateKey}`, {
            id: `OVR-${employeeId}-${dateKey}`,
            employeeId,
            date: toDateKey(new Date(`${dateKey}T00:00:00`)),
            shiftId: payload.shiftId,
            status: 'console-assigned',
          });
        });
      });

      return Array.from(next.values());
    });

    toast.success(`Custom shift ${shift.name} assigned to ${payload.employeeIds.length} employee(s).`);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
        <div className="flex min-w-64 items-center gap-2">
          <Input
            placeholder="Search employee"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

         <WeekNavigator
          weekRangeLabel={weekRange}
          weekOffset={weekOffset}
          onPrevious={() => setWeekOffset((current) => current - 1)}
          onNext={() => setWeekOffset((current) => current + 1)}
          onToday={() => setWeekOffset(0)}
        />
      
        <ShiftStatusLegend />
        <Button onClick={() => setIsDialogOpen(true)}>Assign</Button>
      </div>

      <Card className="h-[calc(100vh-195px)] min-h-160 p-0">
          <div className="h-full">
            <ShiftAssignmentTable
              employees={filteredEmployees}
              weekDates={weekDates}
              cellsByEmployee={cellsByEmployee}
            />
          </div>
      </Card>

      <AssignShiftDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employees={employees}
        shiftGroups={shiftGroups}
        shifts={shiftTemplates}
        onApply={applyShiftAssignment}
      />
    </div>
  );
};

export default AdminShifts;
