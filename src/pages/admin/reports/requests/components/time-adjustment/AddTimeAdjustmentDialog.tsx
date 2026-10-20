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
import { Textarea } from '../../../../../../../components/ui/textarea';
import type { ReportEmployeeSummary, TimeAdjustmentRecord } from '../../types';

interface AddTimeAdjustmentDialogProps {
  open: boolean;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onSubmit: (record: TimeAdjustmentRecord) => void;
}

const AddTimeAdjustmentDialog: React.FC<AddTimeAdjustmentDialogProps> = ({
  open,
  employee,
  onClose,
  onSubmit,
}) => {
  const [timeIn, setTimeIn] = React.useState<string>('');
  const [timeOut, setTimeOut] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setTimeIn('');
      setTimeOut('');
      setNotes('');
    }
  }, [open]);

  const canSubmit = Boolean(employee && timeIn && timeOut);

  const submit = (): void => {
    if (!employee || !canSubmit) {
      return;
    }

    onSubmit({
      id: `TA-${Date.now()}`,
      employeeId: employee.id,
      requestedAt: new Date().toISOString(),
      specifiedTimeIn: timeIn,
      specifiedTimeOut: timeOut,
      actualTimeOut: timeOut,
      notes: notes.trim(),
      status: 'Unprocessed',
      processedBy: {
        id: 'PR-SYS',
        name: 'System Queue',
        avatarUrl: 'https://picsum.photos/seed/system-queue-ta/80/80',
      },
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Time Adjustment</DialogTitle>
          <DialogDescription>Create a time adjustment request for the selected employee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Input value={employee?.fullName || ''} disabled />
          </div>

          <div className="space-y-1">
            <Label>Specified Time In</Label>
            <Input type="datetime-local" value={timeIn} onChange={(event) => setTimeIn(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Specified Time Out</Label>
            <Input type="datetime-local" value={timeOut} onChange={(event) => setTimeOut(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>Add Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimeAdjustmentDialog;
