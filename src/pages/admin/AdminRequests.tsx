'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { Check, X, FileText } from 'lucide-react';
import { RequestType, RequestStatus } from '../../types/index';

interface AdminRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: RequestType;
  status: RequestStatus;
  submittedDate: string;
  details: string;
  amount?: number;
  receiptUrl?: string;
}

const requestsData: AdminRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    department: 'Science',
    type: RequestType.LEAVE,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-10',
    details: 'Annual leave request for March 15-20',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    department: 'Mathematics',
    type: RequestType.EXPENSE,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-08',
    details: 'Conference registration expenses',
    amount: 500,
    receiptUrl: 'receipt-001.pdf',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Michael Chen',
    department: 'Science',
    type: RequestType.WFH,
    status: RequestStatus.APPROVED,
    submittedDate: '2024-03-05',
    details: 'Work from home request for March 12',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Emma Davis',
    department: 'English',
    type: RequestType.OVERTIME,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-03',
    details: '4 hours overtime on March 8',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    employeeName: 'Robert Wilson',
    department: 'History',
    type: RequestType.FUNDS,
    status: RequestStatus.REJECTED,
    submittedDate: '2024-02-28',
    details: 'Project funding request for research materials',
    amount: 1200,
  },
  {
    id: '6',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    department: 'Science',
    type: RequestType.UNDERTIME,
    status: RequestStatus.APPROVED,
    submittedDate: '2024-02-25',
    details: '2 hours undertime on February 24',
  },
  {
    id: '7',
    employeeId: 'EMP006',
    employeeName: 'Lisa Anderson',
    department: 'Mathematics',
    type: RequestType.ATTENDANCE_ADJUSTMENT,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-11',
    details: 'Mark as present for March 7 - System error',
  },
  {
    id: '8',
    employeeId: 'EMP007',
    employeeName: 'James Martinez',
    department: 'Science',
    type: RequestType.SHIFT_SWAP,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-09',
    details: 'Swap shift with colleague for March 15',
  },
];

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequest[]>(requestsData);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: RequestStatus.APPROVED } : req
      )
    );
    toast.success('Request approved');
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: RequestStatus.REJECTED } : req
      )
    );
    toast.success('Request rejected');
  };

  const openDetails = (request: AdminRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      [RequestStatus.APPROVED]: 'bg-green-100 text-green-800',
      [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
      [RequestStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    };
    return variants[status];
  };

  const getStatusLabel = (status: RequestStatus) => {
    const labels: Record<RequestStatus, string> = {
      [RequestStatus.APPROVED]: 'Approved',
      [RequestStatus.PENDING]: 'Pending',
      [RequestStatus.REJECTED]: 'Rejected',
      [RequestStatus.CANCELLED]: 'Cancelled',
    };
    return labels[status];
  };

  const filterRequests = (status: RequestStatus | 'all') => {
    return status === 'all'
      ? requests
      : requests.filter((req) => req.status === status);
  };

  const renderTable = (data: AdminRequest[]) => (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Employee Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Request Type</TableHead>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No requests found
              </TableCell>
            </TableRow>
          ) : (
            data.map((request) => (
              <TableRow key={request.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell
                  className="font-medium"
                  onClick={() => openDetails(request)}
                >
                  {request.employeeName}
                </TableCell>
                <TableCell onClick={() => openDetails(request)}>
                  {request.department}
                </TableCell>
                <TableCell
                  className="capitalize"
                  onClick={() => openDetails(request)}
                >
                  {request.type.replace('_', ' ')}
                </TableCell>
                <TableCell onClick={() => openDetails(request)}>
                  {request.submittedDate}
                </TableCell>
                <TableCell onClick={() => openDetails(request)}>
                  <Badge className={getStatusBadge(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {request.status === RequestStatus.PENDING && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Request Management</h1>

      <Card>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value={RequestStatus.PENDING}>Pending</TabsTrigger>
            <TabsTrigger value={RequestStatus.APPROVED}>Approved</TabsTrigger>
            <TabsTrigger value={RequestStatus.REJECTED}>Rejected</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="all" className="mt-0">
              {renderTable(filterRequests('all'))}
            </TabsContent>
            <TabsContent value={RequestStatus.PENDING} className="mt-0">
              {renderTable(filterRequests(RequestStatus.PENDING))}
            </TabsContent>
            <TabsContent value={RequestStatus.APPROVED} className="mt-0">
              {renderTable(filterRequests(RequestStatus.APPROVED))}
            </TabsContent>
            <TabsContent value={RequestStatus.REJECTED} className="mt-0">
              {renderTable(filterRequests(RequestStatus.REJECTED))}
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Employee Name
                  </p>
                  <p className="text-base font-semibold">
                    {selectedRequest.employeeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="text-base font-semibold">
                    {selectedRequest.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Request Type
                  </p>
                  <p className="text-base font-semibold capitalize">
                    {selectedRequest.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge className={getStatusBadge(selectedRequest.status)}>
                    {getStatusLabel(selectedRequest.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date Submitted
                </p>
                <p className="text-base font-semibold">
                  {selectedRequest.submittedDate}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Details
                </p>
                <p className="text-base">{selectedRequest.details}</p>
              </div>

              {selectedRequest.amount && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount Requested
                  </p>
                  <p className="text-base font-semibold">
                    ${selectedRequest.amount.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedRequest.receiptUrl && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      console.log(
                        `View receipt: ${selectedRequest.receiptUrl}`
                      )
                    }
                  >
                    <FileText className="h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
