import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../../components/ui/table';
import type { FundRecord, ReportEmployeeSummary } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils';

interface FundBreakdownDialogProps {
  open: boolean;
  fund: FundRecord | null;
  employee: ReportEmployeeSummary | null;
  onClose: () => void;
}

const FundBreakdownDialog: React.FC<FundBreakdownDialogProps> = ({ open, fund, employee, onClose }) => {
  if (!fund) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Fund Payment Trail</DialogTitle>
          <DialogDescription>Payment breakdown and status trail for the selected request.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Request Summary</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Total Fund Request: <strong>{formatCurrency(fund.amount)}</strong></p>
              <p>No. of Terms: <strong>{fund.terms}</strong></p>
              <p>Total Paid: <strong>{formatCurrency(fund.paidAmount)}</strong></p>
              <p>Terms Paid: <strong>{fund.paidTerms}</strong></p>
              <p>Balance: <strong>{formatCurrency(fund.remainingPayable)}</strong></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Employee</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Name: <strong>{employee?.fullName || 'Unknown'}</strong></p>
              <p>Position: <strong>{employee?.position || 'N/A'}</strong></p>
              <p>Request Reason: <strong>{fund.requestReason}</strong></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Deduction</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Mode: <strong>{fund.deductionMode}</strong></p>
              <p>Start: <strong>{formatDateTime(fund.deductionStart)}</strong></p>
              <p>Deduct / Term: <strong>{formatCurrency(fund.deductPerTerm)}</strong></p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paid Date</TableHead>
                <TableHead>Payroll Period</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount Deducted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fund.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
                  <TableCell>{payment.payrollPeriod}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>{formatCurrency(payment.amountDeducted)}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundBreakdownDialog;
