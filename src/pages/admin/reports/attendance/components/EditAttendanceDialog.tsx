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
import type { DtrEntry, ShiftType } from '../types';

interface EditAttendanceDialogProps {
  open: boolean;
  entry: DtrEntry | null;
  onClose: () => void;
  onSave: (entryId: string, payload: Pick<DtrEntry, 'shift' | 'timeIn' | 'timeOut'>) => void;
}

const shifts: ShiftType[] = ['Morning', 'Mid', 'Night', 'Flexible'];

const EditAttendanceDialog: React.FC<EditAttendanceDialogProps> = ({ open, entry, onClose, onSave }) => {
  const [shift, setShift] = useState<ShiftType>('Morning');
  const [timeIn, setTimeIn] = useState<string>('');
  const [timeOut, setTimeOut] = useState<string>('');

  React.useEffect(() => {
    if (!entry) {
      return;
    }
    setShift(entry.shift);
    setTimeIn(entry.timeIn);
    setTimeOut(entry.timeOut);
  }, [entry]);

  const handleSave = (): void => {
    if (!entry) {
      return;
    }
    onSave(entry.id, { shift, timeIn, timeOut });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>Change shift, time in, and time out for this DTR entry.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAttendanceDialog;
