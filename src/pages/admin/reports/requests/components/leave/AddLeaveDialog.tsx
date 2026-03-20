import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../../../components/ui/dialog';
import { Button } from '../../../../../../../components/ui/button';
import { Input } from '../../../../../../../components/ui/input';
import { Label } from '../../../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../components/ui/select';
import { Checkbox } from '../../../../../../../components/ui/checkbox';
import { Textarea } from '../../../../../../../components/ui/textarea';
import type { LeaveRecord, LeaveType, ReportEmployeeSummary } from '../../types';

interface AddLeaveDialogProps {
  open: boolean;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onSubmit: (record: LeaveRecord) => void;
  relieverOptions: ReportEmployeeSummary[];
}

const leaveTypes: LeaveType[] = [
  'Vacation',
  'Earned',
  'Maternity',
  'Quarantine',
  'Sick',
  'Emergency',
  'Paternity',
  'Birthday',
  'Casual',
  'Others',
];

const AddLeaveDialog: React.FC<AddLeaveDialogProps> = ({ open, employee, onClose, onSubmit, relieverOptions }) => {
  const [leaveType, setLeaveType] = React.useState<LeaveType>('Vacation');
  const [dateType, setDateType] = React.useState<'Wholeday' | 'Half Day'>('Wholeday');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [halfDate, setHalfDate] = React.useState<string>('');
  const [reliever, setReliever] = React.useState<string>('none');
  const [isPaid, setIsPaid] = React.useState<boolean>(true);
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setLeaveType('Vacation');
      setDateType('Wholeday');
      setStartDate('');
      setEndDate('');
      setHalfDate('');
      setReliever('none');
      setIsPaid(true);
      setNotes('');
    }
  }, [open]);

  const canSubmit = employee && (dateType === 'Wholeday' ? startDate && endDate : halfDate);

  const submit = (): void => {
    if (!employee || !canSubmit) {
      return;
    }

    const start = dateType === 'Wholeday' ? startDate : halfDate;
    const end = dateType === 'Wholeday' ? endDate : halfDate;

    onSubmit({
      id: `LEAVE-${Date.now()}`,
      employeeId: employee.id,
      filedAt: new Date().toISOString(),
      leaveType,
      startDate: start,
      endDate: end,
      duration: dateType === 'Wholeday' ? 'Wholeday' : 'Half day',
      notes,
      paid: isPaid,
      status: 'Unprocessed',
      reliever: reliever === 'none' ? 'N/A' : reliever,
      remarks: isPaid ? 'Pending credit validation.' : 'Unpaid leave.',
      processedBy: {
        id: 'PR-SYS',
        name: 'System Queue',
        avatarUrl: 'https://picsum.photos/seed/system-queue/80/80',
      },
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Leave</DialogTitle>
          <DialogDescription>Create a leave filing for the selected employee.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Input value={employee?.fullName || ''} disabled />
          </div>

          <div className="space-y-1">
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={(next) => setLeaveType(next as LeaveType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Date Type</Label>
            <Select value={dateType} onValueChange={(next) => setDateType(next as 'Wholeday' | 'Half Day')}>
              <SelectTrigger>
                <SelectValue placeholder="Select date type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wholeday">Wholeday</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateType === 'Wholeday' ? (
            <>
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={halfDate} onChange={(event) => setHalfDate(event.target.value)} />
            </div>
          )}

          <div className="space-y-1">
            <Label>Reliever (Optional)</Label>
            <Select value={reliever} onValueChange={setReliever}>
              <SelectTrigger>
                <SelectValue placeholder="Select reliever" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {relieverOptions
                  .filter((option) => option.id !== employee?.id)
                  .map((option) => (
                    <SelectItem key={option.id} value={option.fullName}>{option.fullName}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <Checkbox checked={isPaid} onCheckedChange={(next) => setIsPaid(Boolean(next))} />
            <Label>Paid Leave</Label>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Notes / Reason</Label>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Enter reason" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>Add Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeaveDialog;
