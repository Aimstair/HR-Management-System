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
import type { ReportEmployeeSummary, UndertimeRecord } from '../../types';

interface AddUndertimeDialogProps {
  open: boolean;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onSubmit: (record: UndertimeRecord) => void;
}

const AddUndertimeDialog: React.FC<AddUndertimeDialogProps> = ({ open, employee, onClose, onSubmit }) => {
  const [from, setFrom] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setFrom('');
      setNotes('');
    }
  }, [open]);

  const canSubmit = Boolean(employee && from);

  const submit = (): void => {
    if (!employee || !canSubmit) {
      return;
    }

    onSubmit({
      id: `UT-${Date.now()}`,
      employeeId: employee.id,
      requestedAt: new Date().toISOString(),
      specifiedDateTime: from,
      notes: notes.trim(),
      status: 'Unprocessed',
      processedBy: {
        id: 'PR-SYS',
        name: 'System Queue',
        avatarUrl: 'https://picsum.photos/seed/system-queue-ut/80/80',
      },
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Undertime</DialogTitle>
          <DialogDescription>Create an undertime request for the selected employee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Input value={employee?.fullName || ''} disabled />
          </div>

          <div className="space-y-1">
            <Label>From</Label>
            <Input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>Add Undertime</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUndertimeDialog;
