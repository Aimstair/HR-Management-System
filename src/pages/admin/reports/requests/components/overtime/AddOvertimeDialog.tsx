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
import type { OvertimeRecord, ReportEmployeeSummary } from '../../types';

interface AddOvertimeDialogProps {
  open: boolean;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onSubmit: (record: OvertimeRecord) => void;
}

const AddOvertimeDialog: React.FC<AddOvertimeDialogProps> = ({ open, employee, onClose, onSubmit }) => {
  const [start, setStart] = React.useState<string>('');
  const [end, setEnd] = React.useState<string>('');
  const [tasksDone, setTasksDone] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setStart('');
      setEnd('');
      setTasksDone('');
      setNotes('');
    }
  }, [open]);

  const canSubmit = Boolean(employee && start && end && tasksDone.trim());

  const submit = (): void => {
    if (!employee || !canSubmit) {
      return;
    }

    onSubmit({
      id: `OT-${Date.now()}`,
      employeeId: employee.id,
      requestedAt: new Date().toISOString(),
      overtimeStart: start,
      overtimeEnd: end,
      tasksDone: tasksDone.trim(),
      notes: notes.trim(),
      status: 'Unprocessed',
      processedBy: {
        id: 'PR-SYS',
        name: 'System Queue',
        avatarUrl: 'https://picsum.photos/seed/system-queue-ot/80/80',
      },
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Overtime</DialogTitle>
          <DialogDescription>Create an overtime request for the selected employee.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label>Employee</Label>
            <Input value={employee?.fullName || ''} disabled />
          </div>

          <div className="space-y-1">
            <Label>Start</Label>
            <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>End</Label>
            <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Projects / Task Done</Label>
          <Textarea
            value={tasksDone}
            onChange={(event) => setTasksDone(event.target.value)}
            placeholder="Describe projects or tasks completed"
          />
        </div>

        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>Add Overtime</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOvertimeDialog;
