import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../../../components/ui/radio-group';
import type { ExportRangeMode } from '../types';

interface ExportDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onExport: (mode: ExportRangeMode, month: string, start: string, end: string) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, title, onClose, onExport }) => {
  const [mode, setMode] = useState<ExportRangeMode>('month');
  const [month, setMonth] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  React.useEffect(() => {
    if (!open) {
      setMode('month');
      setMonth('');
      setStart('');
      setEnd('');
    }
  }, [open]);

  const handleExport = (): void => {
    onExport(mode, month, start, end);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Select month or custom date range.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as ExportRangeMode)}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="month" id="export-month" />
              <Label htmlFor="export-month">Month</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="range" id="export-range" />
              <Label htmlFor="export-range">Date Range</Label>
            </div>
          </RadioGroup>

          {mode === 'month' ? (
            <div className="space-y-2">
              <Label>Month</Label>
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </div>
          ) : (
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
