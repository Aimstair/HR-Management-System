'use client';

import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { RequestStatus, RequestType } from '../../types';

type ManagedRequestStatus =
  | RequestStatus.PENDING
  | RequestStatus.APPROVED
  | RequestStatus.REJECTED;

type StatusFilter = 'all' | ManagedRequestStatus;

interface UnifiedAdminRequest {
  id: string;
  employeeName: string;
  department: string;
  type: RequestType;
  dateSubmitted: string;
  status: ManagedRequestStatus;
  details: string;
}

const REQUEST_TYPE_MENU: readonly { value: RequestType; label: string }[] = [
  { value: RequestType.LEAVE, label: 'Leave' },
  { value: RequestType.EXPENSE, label: 'Expense' },
  { value: RequestType.WFH, label: 'WFH' },
  { value: RequestType.FUNDS, label: 'Funds' },
  { value: RequestType.UNDERTIME, label: 'Undertime' },
  { value: RequestType.OVERTIME, label: 'Overtime' },
  { value: RequestType.ATTENDANCE_ADJUSTMENT, label: 'Attendance Adjustments' },
  { value: RequestType.SHIFT_SWAP, label: 'Shift Swap' },
];

const STATUS_MENU: readonly { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: RequestStatus.PENDING, label: 'Pending' },
  { value: RequestStatus.APPROVED, label: 'Approved' },
  { value: RequestStatus.REJECTED, label: 'Rejected' },
];

const initialRequests: UnifiedAdminRequest[] = [
  {
    id: 'REQ-1001',
    employeeName: 'John Smith',
    department: 'Science',
    type: RequestType.LEAVE,
    dateSubmitted: '2026-03-12',
    status: RequestStatus.PENDING,
    details: 'Annual leave from 2026-03-20 to 2026-03-22 for family event.',
  },
  {
    id: 'REQ-1002',
    employeeName: 'Sarah Johnson',
    department: 'Mathematics',
    type: RequestType.LEAVE,
    dateSubmitted: '2026-03-08',
    status: RequestStatus.APPROVED,
    details: 'Sick leave for 2026-03-09 with medical certificate attached.',
  },
  {
    id: 'REQ-1003',
    employeeName: 'Michael Chen',
    department: 'Science',
    type: RequestType.EXPENSE,
    dateSubmitted: '2026-03-10',
    status: RequestStatus.PENDING,
    details: 'Expense reimbursement amount PHP 4,350 for lab consumables.',
  },
  {
    id: 'REQ-1004',
    employeeName: 'Emma Davis',
    department: 'English',
    type: RequestType.EXPENSE,
    dateSubmitted: '2026-03-04',
    status: RequestStatus.REJECTED,
    details: 'Expense claim amount PHP 1,200 missing official receipt copy.',
  },
  {
    id: 'REQ-1005',
    employeeName: 'Lisa Anderson',
    department: 'Mathematics',
    type: RequestType.WFH,
    dateSubmitted: '2026-03-11',
    status: RequestStatus.PENDING,
    details: 'WFH request for 2026-03-18 due to building maintenance at branch.',
  },
  {
    id: 'REQ-1006',
    employeeName: 'Robert Wilson',
    department: 'History',
    type: RequestType.WFH,
    dateSubmitted: '2026-03-06',
    status: RequestStatus.APPROVED,
    details: 'WFH approved for 2026-03-07 while awaiting internet restoration.',
  },
  {
    id: 'REQ-1007',
    employeeName: 'James Martinez',
    department: 'Science',
    type: RequestType.FUNDS,
    dateSubmitted: '2026-03-05',
    status: RequestStatus.PENDING,
    details: 'Funds request PHP 25,000 for regional robotics competition kits.',
  },
  {
    id: 'REQ-1008',
    employeeName: 'Ava Reyes',
    department: 'Admin',
    type: RequestType.FUNDS,
    dateSubmitted: '2026-02-28',
    status: RequestStatus.REJECTED,
    details: 'Department funds request lacked vendor quotations and itemization.',
  },
  {
    id: 'REQ-1009',
    employeeName: 'Daniel Cruz',
    department: 'Science',
    type: RequestType.UNDERTIME,
    dateSubmitted: '2026-03-13',
    status: RequestStatus.PENDING,
    details: 'Undertime for 1.5 hours on 2026-03-12 for urgent clinic visit.',
  },
  {
    id: 'REQ-1010',
    employeeName: 'Nina Patel',
    department: 'HR',
    type: RequestType.UNDERTIME,
    dateSubmitted: '2026-03-02',
    status: RequestStatus.APPROVED,
    details: 'Undertime on 2026-03-01 for processing government IDs renewal.',
  },
  {
    id: 'REQ-1011',
    employeeName: 'Carlos Mendoza',
    department: 'Operations',
    type: RequestType.OVERTIME,
    dateSubmitted: '2026-03-14',
    status: RequestStatus.PENDING,
    details: 'Overtime request 3 hours on 2026-03-14 for quarter-end reporting.',
  },
  {
    id: 'REQ-1012',
    employeeName: 'Grace Lim',
    department: 'Finance',
    type: RequestType.OVERTIME,
    dateSubmitted: '2026-03-01',
    status: RequestStatus.APPROVED,
    details: 'Overtime 2 hours approved for payroll reconciliation support.',
  },
  {
    id: 'REQ-1013',
    employeeName: 'Patricia Gomez',
    department: 'Registrar',
    type: RequestType.ATTENDANCE_ADJUSTMENT,
    dateSubmitted: '2026-03-09',
    status: RequestStatus.PENDING,
    details: 'Attendance correction to Present for 2026-03-08 due to biometric outage.',
  },
  {
    id: 'REQ-1014',
    employeeName: 'Victor Santos',
    department: 'Registrar',
    type: RequestType.ATTENDANCE_ADJUSTMENT,
    dateSubmitted: '2026-03-03',
    status: RequestStatus.REJECTED,
    details: 'Late tag removal denied due to no supporting gate log.',
  },
  {
    id: 'REQ-1015',
    employeeName: 'Helena Torres',
    department: 'Operations',
    type: RequestType.SHIFT_SWAP,
    dateSubmitted: '2026-03-12',
    status: RequestStatus.PENDING,
    details: 'Swap 2026-03-17 morning shift with Ian Flores (evening shift).',
  },
  {
    id: 'REQ-1016',
    employeeName: 'Ian Flores',
    department: 'Operations',
    type: RequestType.SHIFT_SWAP,
    dateSubmitted: '2026-03-07',
    status: RequestStatus.APPROVED,
    details: 'Shift swap approved for 2026-03-09 due to training assignment.',
  },
];

const statusBadgeClass: Record<ManagedRequestStatus, string> = {
  [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [RequestStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [RequestStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabel: Record<ManagedRequestStatus, string> = {
  [RequestStatus.PENDING]: 'PENDING',
  [RequestStatus.APPROVED]: 'APPROVED',
  [RequestStatus.REJECTED]: 'REJECTED',
};

const AdminRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RequestType>(RequestType.LEAVE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [requests, setRequests] = useState<UnifiedAdminRequest[]>(initialRequests);

  const requestTypeLabel = (type: RequestType): string => {
    const match = REQUEST_TYPE_MENU.find((item) => item.value === type);
    return match ? match.label : 'Request';
  };

  const requestsByType = useMemo(() => {
    return requests.filter((request) => request.type === activeTab);
  }, [requests, activeTab]);

  const visibleRequests = useMemo(() => {
    if (statusFilter === 'all') {
      return requestsByType;
    }

    return requestsByType.filter((request) => request.status === statusFilter);
  }, [requestsByType, statusFilter]);

  const handleStatusUpdate = (
    id: UnifiedAdminRequest['id'],
    nextStatus: Extract<ManagedRequestStatus, RequestStatus.APPROVED | RequestStatus.REJECTED>,
  ): void => {
    let updatedRequest: UnifiedAdminRequest | null = null;

    setRequests((currentRequests) =>
      currentRequests.map((request) => {
        if (request.id !== id || request.status !== RequestStatus.PENDING) {
          return request;
        }

        updatedRequest = { ...request, status: nextStatus };
        return updatedRequest;
      }),
    );

    if (!updatedRequest) {
      return;
    }

    const actionLabel = nextStatus === RequestStatus.APPROVED ? 'approved' : 'rejected';
    toast.success(
      `${requestTypeLabel(updatedRequest.type)} request ${updatedRequest.id} ${actionLabel}.`,
    );
  };

  const pendingCount = requestsByType.filter(
    (request) => request.status === RequestStatus.PENDING,
  ).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Admin Requests Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Review and resolve employee requests by type and status.
        </p>
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex flex-wrap gap-2">
          {REQUEST_TYPE_MENU.map((menu) => (
            <Button
              key={menu.value}
              variant={activeTab === menu.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTab(menu.value);
                setStatusFilter('all');
              }}
            >
              {menu.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{requestTypeLabel(activeTab)} Requests</CardTitle>
          <CardDescription>
            {requestsByType.length} total, {pendingCount} pending action.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              {STATUS_MENU.map((status) => (
                <TabsTrigger key={status.value} value={status.value}>
                  {status.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visibleRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No requests found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{request.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{request.department}</p>
                        </div>
                      </TableCell>

                      <TableCell>{request.dateSubmitted}</TableCell>

                      <TableCell>
                        <Badge className={statusBadgeClass[request.status]}>
                          {statusLabel[request.status]}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <p className="max-w-[520px] text-sm text-muted-foreground whitespace-normal">
                          {request.details}
                        </p>
                      </TableCell>

                      <TableCell>
                        {request.status === RequestStatus.PENDING ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              onClick={() => handleStatusUpdate(request.id, RequestStatus.APPROVED)}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              onClick={() => handleStatusUpdate(request.id, RequestStatus.REJECTED)}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRequests;
