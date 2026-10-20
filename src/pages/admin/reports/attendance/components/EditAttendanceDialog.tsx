import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../../components/ui/dialog';
import { Button } from '../../../../../../components/ui/button';
import { Label } from '../../../../../../components/ui/label';
import { Input } from '../../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { Textarea } from '../../../../../../components/ui/textarea';
import type { DtrEntry, ShiftType, TeachingClassSessionOption } from '../types';
import { EmployeeType } from '../../../../../types';

interface EditAttendanceDialogProps {
  open: boolean;
  entry: DtrEntry | null;
  employeeType: EmployeeType;
  classSessions: TeachingClassSessionOption[];
  onClose: () => void;
  onSave: (
    entryId: string,
    payload:
      | Pick<DtrEntry, 'shift' | 'timeIn' | 'timeOut'>
      | { classSessionId: string; status: NonNullable<DtrEntry['attendanceStatus']>; remarks: string },
  ) => void;
}

const shifts: ShiftType[] = ['Morning', 'Mid', 'Night', 'Flexible'];

const EditAttendanceDialog: React.FC<EditAttendanceDialogProps> = ({
  open,
  entry,
  employeeType,
  classSessions,
  onClose,
  onSave,
}) => {
  const [shift, setShift] = useState<ShiftType>('Morning');
  const [timeIn, setTimeIn] = useState<string>('');
  const [timeOut, setTimeOut] = useState<string>('');
  const [classSessionId, setClassSessionId] = useState<string>('');
  const [status, setStatus] = useState<NonNullable<DtrEntry['attendanceStatus']>>('PRESENT');
  const [remarks, setRemarks] = useState<string>('');

  React.useEffect(() => {
    if (!entry) {
      return;
    }
    if (employeeType === EmployeeType.TEACHING) {
      setClassSessionId(entry.classSessionId ?? '');
      setStatus(entry.attendanceStatus ?? 'PRESENT');
      setRemarks(entry.remarks ?? '');
      return;
    }

    setShift(entry.shift);
    setTimeIn(entry.timeIn);
    setTimeOut(entry.timeOut);
  }, [entry, employeeType]);

  const handleSave = (): void => {
    if (!entry) {
      return;
    }
    if (employeeType === EmployeeType.TEACHING) {
      onSave(entry.id, { classSessionId, status, remarks });
      onClose();
      return;
    }

    onSave(entry.id, { shift, timeIn, timeOut });
    onClose();
  };

  const canSave = employeeType === EmployeeType.TEACHING
    ? Boolean(classSessionId)
    : Boolean(timeIn && timeOut);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>Change shift, time in, and time out for this DTR entry.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {employeeType === EmployeeType.TEACHING ? (
            <>
              <div className="space-y-2">
                <Label>Class Session</Label>
                <Select value={classSessionId} onValueChange={setClassSessionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class session" />
                  </SelectTrigger>
                  <SelectContent>
                    {classSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="EXCUSED">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Shift</Label>
                <Select value={shift} onValueChange={(value) => setShift(value as ShiftType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time In</Label>
                <Input type="datetime-local" value={timeIn} onChange={(event) => setTimeIn(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Time Out</Label>
                <Input type="datetime-local" value={timeOut} onChange={(event) => setTimeOut(event.target.value)} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAttendanceDialog;
