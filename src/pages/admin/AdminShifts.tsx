import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

interface ShiftRow {
  id: string;
  employeeName: string;
  assignments: Record<Weekday, string>;
}

interface ShiftFormValues {
  startTime: string;
  endTime: string;
}

interface SelectedCell {
  employeeId: string;
  employeeName: string;
  day: Weekday;
  currentShift: string;
}

const weekdays: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeOptions: string[] = [
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

const initialShifts: ShiftRow[] = [
  {
    id: 'EMP-001',
    employeeName: 'John Smith',
    assignments: {
      Monday: '08:00 AM - 04:00 PM',
      Tuesday: '08:00 AM - 04:00 PM',
      Wednesday: '08:00 AM - 04:00 PM',
      Thursday: '08:00 AM - 04:00 PM',
      Friday: '08:00 AM - 04:00 PM',
    },
  },
  {
    id: 'EMP-002',
    employeeName: 'Sarah Johnson',
    assignments: {
      Monday: '09:00 AM - 05:00 PM',
      Tuesday: '09:00 AM - 05:00 PM',
      Wednesday: '09:00 AM - 05:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 05:00 PM',
    },
  },
  {
    id: 'EMP-003',
    employeeName: 'Michael Chen',
    assignments: {
      Monday: '07:00 AM - 03:00 PM',
      Tuesday: '07:00 AM - 03:00 PM',
      Wednesday: '08:00 AM - 04:00 PM',
      Thursday: '08:00 AM - 04:00 PM',
      Friday: '07:00 AM - 03:00 PM',
    },
  },
  {
    id: 'EMP-004',
    employeeName: 'Emma Davis',
    assignments: {
      Monday: '10:00 AM - 06:00 PM',
      Tuesday: '10:00 AM - 06:00 PM',
      Wednesday: '10:00 AM - 06:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 05:00 PM',
    },
  },
  {
    id: 'EMP-005',
    employeeName: 'Lisa Anderson',
    assignments: {
      Monday: '08:00 AM - 04:00 PM',
      Tuesday: '08:00 AM - 04:00 PM',
      Wednesday: '08:00 AM - 04:00 PM',
      Thursday: '12:00 PM - 06:00 PM',
      Friday: '12:00 PM - 06:00 PM',
    },
  },
];

const AdminShifts: React.FC = () => {
  const [shiftRows, setShiftRows] = useState<ShiftRow[]>(initialShifts);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<ShiftFormValues>({
    defaultValues: {
      startTime: '08:00 AM',
      endTime: '04:00 PM',
    },
  });

  const chosenShiftPreview = useMemo(() => {
    return `${watch('startTime')} - ${watch('endTime')}`;
  }, [watch]);

  const handleCellClick = (row: ShiftRow, day: Weekday): void => {
    setSelectedCell({
      employeeId: row.id,
      employeeName: row.employeeName,
      day,
      currentShift: row.assignments[day],
    });

    reset({
      startTime: '08:00 AM',
      endTime: '04:00 PM',
    });
    setIsDialogOpen(true);
  };

  const onAssignShift = (values: ShiftFormValues): void => {
    if (!selectedCell) {
      return;
    }

    const nextShift = `${values.startTime} - ${values.endTime}`;

    setShiftRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedCell.employeeId
          ? {
              ...row,
              assignments: {
                ...row.assignments,
                [selectedCell.day]: nextShift,
              },
            }
          : row,
      ),
    );

    toast.success(
      `${selectedCell.employeeName} assigned ${nextShift} for ${selectedCell.day}.`,
    );

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Weekly Shift Management</h1>
        <p className="text-sm text-muted-foreground">
          Click any day cell to assign or update an employee shift.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Assignment Matrix</CardTitle>
          <CardDescription>Monday to Friday schedule overview.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  {weekdays.map((day) => (
                    <TableHead key={day}>{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {shiftRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.employeeName}</TableCell>
                    {weekdays.map((day) => (
                      <TableCell key={`${row.id}-${day}`}>
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => handleCellClick(row, day)}
                        >
                          <Badge variant="outline" className="max-w-full whitespace-normal">
                            {row.assignments[day]}
                          </Badge>
                        </button>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Shift</DialogTitle>
            <DialogDescription>
              {selectedCell
                ? `Set ${selectedCell.day} shift for ${selectedCell.employeeName}.`
                : 'Select a cell to assign a shift.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onAssignShift)}>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Controller
                name="startTime"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Controller
                name="endTime"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Preview</p>
              <p className="text-sm font-medium">{chosenShiftPreview}</p>
              {selectedCell && (
                <p className="text-xs text-muted-foreground">
                  Current: {selectedCell.currentShift}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">Assign Shift</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShifts;
