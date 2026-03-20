import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../components/ui/select';
import type { ScopeFilterMode, ScopeFilterState } from '../types';

interface ScopeFilterDialogProps {
  open: boolean;
  mode: ScopeFilterMode;
  value: ScopeFilterState;
  onClose: () => void;
  onApply: (next: ScopeFilterState) => void;
}

const ScopeFilterDialog: React.FC<ScopeFilterDialogProps> = ({ open, mode, value, onClose, onApply }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [draft, setDraft] = React.useState<ScopeFilterState>(value);

  React.useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const monthOptions = Array.from({ length: 12 }).map((_, index) => ({
    value: String(index),
    label: new Date(2000, index, 1).toLocaleString('en-US', { month: 'long' }),
  }));
  const yearOptions = Array.from({ length: 11 }).map((_, offset) => String(currentYear - 5 + offset));

  const save = (): void => {
    onApply({
      ...draft,
      mode,
      month: draft.month || String(now.getMonth()),
      year: draft.year || String(currentYear),
    });
    onClose();
  };

  const canApply = mode === 'range' ? Boolean(draft.rangeStart && draft.rangeEnd) : true;

  const title = mode === 'month' ? 'Select Month and Year' : 'Select Date Range';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Choose the request report period.</DialogDescription>
        </DialogHeader>

        {mode === 'month' ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Month</Label>
              <Select value={draft.month} onValueChange={(next) => setDraft((current) => ({ ...current, month: next }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={draft.year} onValueChange={(next) => setDraft((current) => ({ ...current, year: next }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {mode === 'range' ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={draft.rangeStart}
                onChange={(event) => setDraft((current) => ({ ...current, rangeStart: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={draft.rangeEnd}
                onChange={(event) => setDraft((current) => ({ ...current, rangeEnd: event.target.value }))}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={save} disabled={!canApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScopeFilterDialog;
