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
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import type { FundPaymentRecord, FundRecord, ReportEmployeeSummary } from '../../types';
import { formatCurrency } from '../../utils';

interface AddFundPaymentDialogProps {
  open: boolean;
  fund: FundRecord | null;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
  onAddPayment: (payment: FundPaymentRecord) => void;
}

const AddFundPaymentDialog: React.FC<AddFundPaymentDialogProps> = ({
  open,
  fund,
  employee,
  onClose,
  onAddPayment,
}) => {
  const [description, setDescription] = React.useState<string>('Manual payment');
  const [paidTerms, setPaidTerms] = React.useState<string>('1');
  const [amountPaid, setAmountPaid] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setDescription('Manual payment');
      setPaidTerms('1');
      setAmountPaid(fund ? String(fund.deductPerTerm) : '');
    }
  }, [open, fund]);

  if (!fund) {
    return null;
  }

  const submit = (): void => {
    const amount = Number.parseFloat(amountPaid);
    const terms = Number.parseInt(paidTerms, 10);
    if (Number.isNaN(amount) || Number.isNaN(terms) || amount <= 0 || terms <= 0) {
      return;
    }

    onAddPayment({
      id: `PAY-${Date.now()}`,
      paidAt: new Date().toISOString(),
      payrollPeriod: `Manual-${Date.now().toString().slice(-4)}`,
      description,
      amountDeducted: amount,
      status: 'Paid',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Payment to Fund Request</DialogTitle>
          <DialogDescription>Post an additional payment to this fund request.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Fund Request Details</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Employee: <strong>{employee?.fullName || 'Unknown'}</strong></p>
              <p>Type: <strong>{fund.requestType}</strong></p>
              <p>Purpose: <strong>{fund.requestReason}</strong></p>
              <p>Deduction: <strong>{formatCurrency(fund.deductPerTerm)}</strong> / term</p>
              <p>Terms: <strong>{fund.terms}</strong> total, <strong>{fund.paidTerms}</strong> paid</p>
              <p>Amount: <strong>{formatCurrency(fund.amount)}</strong> total</p>
              <p>Remaining: <strong>{formatCurrency(fund.remainingPayable)}</strong></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Additional Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Paid Terms</Label>
                <Input type="number" min={1} value={paidTerms} onChange={(event) => setPaidTerms(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Amount Paid</Label>
                <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit}>Add Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundPaymentDialog;
