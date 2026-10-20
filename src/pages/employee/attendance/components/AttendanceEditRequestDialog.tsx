import React from 'react';
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
import { Textarea } from '../../../../../components/ui/textarea';
import type { EmployeeAttendanceEntry } from '../../shared/employeePortalTypes';
import { formatDateLabel } from '../../shared/employeePortalUtils';

interface AttendanceEditRequestDialogProps {
  open: boolean;
  entry: EmployeeAttendanceEntry | null;
  title?: string;
  description?: string;
  onClose: () => void;
  onSubmit: (payload: {
    timeIn: string;
    timeOut: string;
    reason: string;
  }) => void;
}

const toTimeInput = (isoDateTime: string | null): string => {
  if (!isoDateTime) {
    return '';
  }

  const date = new Date(isoDateTime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const AttendanceEditRequestDialog: React.FC<AttendanceEditRequestDialogProps> = ({
  open,
  entry,
  title,
  description,
  onClose,
  onSubmit,
}) => {
  const [timeIn, setTimeIn] = React.useState('');
  const [timeOut, setTimeOut] = React.useState('');
  const [reason, setReason] = React.useState('');
  const isTeachingAppeal = entry?.mode === 'TEACHING_SESSION';

  React.useEffect(() => {
    if (!entry || !open) {
      return;
    }

    setTimeIn(toTimeInput(entry.timeIn));
    setTimeOut(toTimeInput(entry.timeOut));
    setReason('');
  }, [entry, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({
      timeIn: isTeachingAppeal ? '' : timeIn,
      timeOut: isTeachingAppeal ? '' : timeOut,
      reason,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? 'Request Attendance Edit'}</DialogTitle>
          <DialogDescription>
            {description ?? (entry
              ? `File an attendance edit request for ${formatDateLabel(entry.date)}.`
              : 'Select an attendance entry to request edits.')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isTeachingAppeal ? null : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendance-time-in">Time In</Label>
                <Input
                  id="attendance-time-in"
                  type="time"
                  value={timeIn}
                  onChange={(event) => setTimeIn(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-time-out">Time Out</Label>
                <Input
                  id="attendance-time-out"
                  type="time"
                  value={timeOut}
                  onChange={(event) => setTimeOut(event.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="attendance-reason">Reason</Label>
            <Textarea
              id="attendance-reason"
              placeholder="Describe why this attendance entry needs correction"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceEditRequestDialog;
