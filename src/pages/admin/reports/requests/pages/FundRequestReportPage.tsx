import React, { useMemo, useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../../../components/ui/dropdown-menu';
import { Progress } from '../../../../../../components/ui/progress';
import EmployeeListPanel from '../components/EmployeeListPanel';
import GenericReportTable from '../components/GenericReportTable';
import ProcessorAvatar from '../components/ProcessorAvatar';
import ScopeFilterDialog from '../components/ScopeFilterDialog';
import AddFundPaymentDialog from '../components/fund/AddFundPaymentDialog';
import AddFundRequestDialog from '../components/fund/AddFundRequestDialog';
import FundBreakdownDialog from '../components/fund/FundBreakdownDialog';
import { fundRecords as initialFundRecords, reportEmployees } from '../mockData';
import type { FundRecord, ScopeFilterState } from '../types';
import { formatCurrency, formatDateTime, isInScope } from '../utils';

const defaultScope: ScopeFilterState = {
  mode: 'last30',
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const FundRequestReportPage: React.FC = () => {
  const [scope, setScope] = useState<ScopeFilterState>(defaultScope);
  const [isScopeOpen, setIsScopeOpen] = useState<boolean>(false);
  const [fundRows, setFundRows] = useState<FundRecord[]>(initialFundRecords);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(reportEmployees[0]?.id || null);
  const [activeFund, setActiveFund] = useState<FundRecord | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [isAddFundOpen, setIsAddFundOpen] = useState<boolean>(false);

  const selectedEmployee = useMemo(
    () => reportEmployees.find((employee) => employee.id === selectedEmployeeId) || null,
    [selectedEmployeeId],
  );

  const rows = useMemo(
    () => fundRows.filter((item) => item.employeeId === selectedEmployeeId && isInScope(item.requestedAt, scope)),
    [fundRows, scope, selectedEmployeeId],
  );

  const totalRemainingPayables = useMemo(
    () => rows.reduce((sum, row) => sum + row.remainingPayable, 0),
    [rows],
  );

  const appendPayment = (payment: FundRecord['payments'][number]): void => {
    if (!activeFund) {
      return;
    }

    setFundRows((current) =>
      current.map((row) => {
        if (row.id !== activeFund.id) {
          return row;
        }

        const nextPaidAmount = row.paidAmount + payment.amountDeducted;
        const nextPaidTerms = Math.min(row.terms, row.paidTerms + 1);

        return {
          ...row,
          payments: [payment, ...row.payments],
          paidAmount: nextPaidAmount,
          paidTerms: nextPaidTerms,
          remainingPayable: Math.max(row.amount - nextPaidAmount, 0),
        };
      }),
    );

    toast.success('Payment added to fund request.');
  };

  const addFund = (record: FundRecord): void => {
    setFundRows((current) => [record, ...current]);
    toast.success('Fund request added.');
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <EmployeeListPanel
        title="Fund Request Employees"
        metricLabel="Total Amount"
        secondaryMetricLabel="Remaining"
        employees={reportEmployees}
        selectedEmployeeId={selectedEmployeeId}
        scope={scope}
        onSelectEmployee={setSelectedEmployeeId}
        onScopeChange={setScope}
        onOpenScopeModal={() => setIsScopeOpen(true)}
        metricBuilder={(employee) => formatCurrency(employee.fundTotal)}
        secondaryMetricBuilder={(employee) => formatCurrency(employee.fundRemaining)}
        exportRowsBuilder={(employeeId) => {
          const employeeRows = fundRows.filter((item) => item.employeeId === employeeId);
          return employeeRows.map((item) => [
            item.requestType,
            formatDateTime(item.requestedAt),
            item.requestReason,
            String(item.amount),
            String(item.remainingPayable),
            item.status,
          ]);
        }}
      />

      <Card className="h-[calc(100vh-220px)] min-h-[640px]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Fund Request Report</CardTitle>
              <CardDescription>
                {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.position})` : 'Select employee'}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddFundOpen(true)} disabled={!selectedEmployee}>
              <Plus className="h-4 w-4" />
              Add Fund Request
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Total Remaining Payables: <strong>{formatCurrency(totalRemainingPayables)}</strong></p>
        </CardHeader>
        <CardContent>
          <GenericReportTable
            rows={rows}
            emptyMessage="No fund request records for selected employee and filter."
            columns={[
              {
                id: 'fileInfo',
                label: 'File Info',
                render: (row) => (
                  <div className="text-sm">
                    <p className="font-medium">{row.requestType}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(row.requestedAt)}</p>
                  </div>
                ),
              },
              {
                id: 'deductionInfo',
                label: 'Deduction Info',
                render: (row) => (
                  <div className="text-sm">
                    <p>{row.deductionMode}</p>
                    <p className="text-xs text-muted-foreground">Start: {formatDateTime(row.deductionStart)}</p>
                  </div>
                ),
              },
              {
                id: 'details',
                label: 'Request Details',
                render: (row) => (
                  <div className="text-sm space-y-0.5">
                    <p>Reason: {row.requestReason}</p>
                    <p>Amount: {formatCurrency(row.amount)}</p>
                    <p>Deduct / Term: {formatCurrency(row.deductPerTerm)}</p>
                    <p>Terms: {row.terms}</p>
                  </div>
                ),
              },
              {
                id: 'remaining',
                label: 'Remaining Payable',
                render: (row) => formatCurrency(row.remainingPayable),
              },
              {
                id: 'status',
                label: 'Status',
                render: (row) => <Badge variant="outline">{row.status}</Badge>,
              },
              {
                id: 'processedBy',
                label: 'Processed By',
                render: (row) => <ProcessorAvatar processor={row.processedBy} />,
              },
              {
                id: 'progress',
                label: 'Progress Status',
                render: (row) => {
                  const percent = row.amount > 0 ? (row.paidAmount / row.amount) * 100 : 0;
                  return (
                    <div className="space-y-1 min-w-[180px]">
                      <p className="text-xs">Paid: {row.paidTerms}/{row.terms}</p>
                      <Progress value={Math.min(percent, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(row.paidAmount)} paid | {formatCurrency(row.remainingPayable)} remaining
                      </p>
                    </div>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                render: (row) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveFund(row);
                          setIsBreakdownOpen(true);
                        }}
                      >
                        View Breakdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveFund(row);
                          setIsAddPaymentOpen(true);
                        }}
                      >
                        Add Payment to Fund Request
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFundRows((current) => current.map((item) => (
                            item.id === row.id ? { ...item, status: 'Cancelled' } : item
                          )));
                          toast.success('Fund request cancelled.');
                        }}
                      >
                        Cancel Fund Request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <ScopeFilterDialog
        open={isScopeOpen}
        mode={scope.mode === 'today' || scope.mode === 'last30' ? 'month' : scope.mode}
        value={scope}
        onClose={() => setIsScopeOpen(false)}
        onApply={setScope}
      />

      <FundBreakdownDialog
        open={isBreakdownOpen}
        fund={activeFund}
        employee={selectedEmployee}
        onClose={() => setIsBreakdownOpen(false)}
      />

      <AddFundPaymentDialog
        open={isAddPaymentOpen}
        fund={activeFund}
        employee={selectedEmployee}
        onClose={() => setIsAddPaymentOpen(false)}
        onAddPayment={appendPayment}
      />

      <AddFundRequestDialog
        open={isAddFundOpen}
        employee={selectedEmployee}
        onClose={() => setIsAddFundOpen(false)}
        onCreate={addFund}
      />
    </div>
  );
};

export default FundRequestReportPage;
