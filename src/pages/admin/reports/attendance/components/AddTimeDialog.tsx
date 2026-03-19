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
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { Textarea } from '../../../../../../components/ui/textarea';
import type { AddTimeFormValues, ReportEmployee } from '../types';

interface AddTimeDialogProps {
  open: boolean;
  employee: ReportEmployee | null;
  onClose: () => void;
  onAddTime: (values: AddTimeFormValues) => void;
}

const AddTimeDialog: React.FC<AddTimeDialogProps> = ({ open, employee, onClose, onAddTime }) => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (!open) {
      setStart('');
      setEnd('');
      setAgenda('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = (): void => {
    if (!employee) {
      return;
    }

    onAddTime({
      employeeId: employee.id,
      start,
      end,
      agenda,
      notes,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time</DialogTitle>
          <DialogDescription>Add attendance time adjustment for selected employee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Input value={employee ? employee.fullName : ''} disabled />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agenda</Label>
            <Input value={agenda} onChange={(event) => setAgenda(event.target.value)} placeholder="e.g. Overtime Completion" />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add details here" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Time</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimeDialog;
