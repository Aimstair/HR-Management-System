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
import type { FundRecord, ReportEmployeeSummary } from '../../types';

interface AddFundRequestDialogProps {
  open: boolean;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onCreate: (record: FundRecord) => void;
}

const AddFundRequestDialog: React.FC<AddFundRequestDialogProps> = ({ open, employee, onClose, onCreate }) => {
  const [requestType, setRequestType] = React.useState<'Cash Advance' | 'Loan'>('Cash Advance');
  const [loanType, setLoanType] = React.useState<string>('Salary Loan');
  const [deductionMode, setDeductionMode] = React.useState<'Every Pay Day' | 'Every Month'>('Every Pay Day');
  const [deductionStart, setDeductionStart] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [terms, setTerms] = React.useState<string>('');
  const [deductableAmount, setDeductableAmount] = React.useState<string>('');
  const [initiallyPaid, setInitiallyPaid] = React.useState<boolean>(false);
  const [initialDescription, setInitialDescription] = React.useState<string>('Initial down payment');
  const [initialPaidTerms, setInitialPaidTerms] = React.useState<string>('1');
  const [initialPaidAmount, setInitialPaidAmount] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setRequestType('Cash Advance');
      setLoanType('Salary Loan');
      setDeductionMode('Every Pay Day');
      setDeductionStart('');
      setAmount('');
      setTerms('');
      setDeductableAmount('');
      setInitiallyPaid(false);
      setInitialDescription('Initial down payment');
      setInitialPaidTerms('1');
      setInitialPaidAmount('');
      setNotes('');
    }
  }, [open]);

  const submit = (): void => {
    if (!employee) {
      return;
    }

    const totalAmount = Number.parseFloat(amount);
    const totalTerms = Number.parseInt(terms, 10);
    const deductTerm = Number.parseFloat(deductableAmount);
    if (Number.isNaN(totalAmount) || Number.isNaN(totalTerms) || Number.isNaN(deductTerm) || !deductionStart) {
      return;
    }

    const initialTerms = initiallyPaid ? Math.max(1, Number.parseInt(initialPaidTerms, 10) || 1) : 0;
    const initialAmount = initiallyPaid ? Number.parseFloat(initialPaidAmount || '0') : 0;

    onCreate({
      id: `FUND-${Date.now()}`,
      employeeId: employee.id,
      requestType,
      requestReason: requestType === 'Loan' ? `${loanType} - ${notes || 'No notes'}` : notes || 'No notes',
      requestedAt: new Date().toISOString(),
      deductionMode,
      deductionStart,
      amount: totalAmount,
      terms: totalTerms,
      deductPerTerm: deductTerm,
      paidTerms: initialTerms,
      paidAmount: initialAmount,
      remainingPayable: Math.max(totalAmount - initialAmount, 0),
      status: 'Unprocessed',
      processedBy: {
        id: 'PR-SYS',
        name: 'System Queue',
        avatarUrl: 'https://picsum.photos/seed/system-fund/80/80',
      },
      payments: initiallyPaid
        ? [
            {
              id: `PAY-${Date.now()}`,
              paidAt: new Date().toISOString(),
              payrollPeriod: 'Initial',
              description: initialDescription,
              amountDeducted: initialAmount,
              status: 'Paid',
            },
          ]
        : [],
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Fund Request</DialogTitle>
          <DialogDescription>Create a new fund request for the selected employee.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Input value={employee?.fullName || ''} disabled />
          </div>

          <div className="space-y-1">
            <Label>Request Type</Label>
            <Select value={requestType} onValueChange={(next) => setRequestType(next as 'Cash Advance' | 'Loan')}>
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash Advance">Cash Advance</SelectItem>
                <SelectItem value="Loan">Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requestType === 'Loan' ? (
            <div className="space-y-1">
              <Label>Loan Type</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary Loan">Salary Loan</SelectItem>
                  <SelectItem value="Emergency Loan">Emergency Loan</SelectItem>
                  <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1">
            <Label>Deduction Type</Label>
            <Select value={deductionMode} onValueChange={(next) => setDeductionMode(next as 'Every Pay Day' | 'Every Month')}>
              <SelectTrigger>
                <SelectValue placeholder="Select deduction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Every Pay Day">Every Pay Day</SelectItem>
                <SelectItem value="Every Month">Every Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Deduction Starts On</Label>
            <Input type="date" value={deductionStart} onChange={(event) => setDeductionStart(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Total Amount</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>No. of Payment Terms</Label>
            <Input type="number" min={1} value={terms} onChange={(event) => setTerms(event.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Deductable Amount</Label>
            <Input type="number" min={0} step="0.01" value={deductableAmount} onChange={(event) => setDeductableAmount(event.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={initiallyPaid} onCheckedChange={(next) => setInitiallyPaid(Boolean(next))} />
          <Label>Loan initially paid</Label>
        </div>

        {initiallyPaid ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={initialDescription} onChange={(event) => setInitialDescription(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Paid Terms</Label>
              <Input type="number" min={1} value={initialPaidTerms} onChange={(event) => setInitialPaidTerms(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Amount Paid</Label>
              <Input type="number" min={0} step="0.01" value={initialPaidAmount} onChange={(event) => setInitialPaidAmount(event.target.value)} />
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit}>Add Fund Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundRequestDialog;
