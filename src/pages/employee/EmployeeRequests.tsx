'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { RequestType, RequestStatus } from '../../types/index';
import { Plus } from 'lucide-react';

interface RequestHistory {
  id: string;
  type: RequestType;
  status: RequestStatus;
  submittedDate: string;
  description: string;
}

interface SubmitFormData {
  requestType: RequestType | '';
  startDate?: string;
  endDate?: string;
  amount?: number;
  hours?: number;
  date?: string;
  reason: string;
  receipt?: FileList;
}

const requestHistoryData: RequestHistory[] = [
  {
    id: '1',
    type: RequestType.LEAVE,
    status: RequestStatus.APPROVED,
    submittedDate: '2024-03-10',
    description: 'Annual Leave - March 15-20',
  },
  {
    id: '2',
    type: RequestType.EXPENSE,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-08',
    description: 'Conference Registration - $500',
  },
  {
    id: '3',
    type: RequestType.WFH,
    status: RequestStatus.APPROVED,
    submittedDate: '2024-03-05',
    description: 'Work from Home - March 12',
  },
  {
    id: '4',
    type: RequestType.OVERTIME,
    status: RequestStatus.PENDING,
    submittedDate: '2024-03-03',
    description: 'Overtime - 4 hours on March 8',
  },
  {
    id: '5',
    type: RequestType.FUNDS,
    status: RequestStatus.REJECTED,
    submittedDate: '2024-02-28',
    description: 'Project Funding Request - $1,200',
  },
];

const EmployeeRequests: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { control, watch, handleSubmit, reset } = useForm<SubmitFormData>({
    defaultValues: {
      requestType: '',
      reason: '',
    },
  });

  const requestType = watch('requestType');

  const onSubmit = (data: SubmitFormData) => {
    console.log('Form submitted:', data);
    toast.success('Request submitted successfully!');
    reset();
    setIsOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Requests</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Submit New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit New Request</DialogTitle>
              <DialogDescription>
                Fill out the form below to submit your request
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="requestType">Request Type</Label>
                <Controller
                  name="requestType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="requestType">
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RequestType.LEAVE}>Leave</SelectItem>
                        <SelectItem value={RequestType.EXPENSE}>
                          Expense
                        </SelectItem>
                        <SelectItem value={RequestType.WFH}>WFH</SelectItem>
                        <SelectItem value={RequestType.FUNDS}>Funds</SelectItem>
                        <SelectItem value={RequestType.UNDERTIME}>
                          Undertime
                        </SelectItem>
                        <SelectItem value={RequestType.OVERTIME}>
                          Overtime
                        </SelectItem>
                        <SelectItem value={RequestType.ATTENDANCE_ADJUSTMENT}>
                          Attendance Adjustment
                        </SelectItem>
                        <SelectItem value={RequestType.SHIFT_SWAP}>
                          Shift Swap
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {(requestType === RequestType.LEAVE ||
                requestType === RequestType.WFH) && (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="startDate"
                          type="date"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="endDate"
                          type="date"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </>
              )}

              {(requestType === RequestType.EXPENSE ||
                requestType === RequestType.FUNDS) && (
                <>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                  {requestType === RequestType.EXPENSE && (
                    <div>
                      <Label htmlFor="receipt">Receipt (File)</Label>
                      <Controller
                        name="receipt"
                        control={control}
                        render={({ field: { onChange } }) => (
                          <Input
                            id="receipt"
                            type="file"
                            onChange={(e) => onChange(e.target.files)}
                          />
                        )}
                      />
                    </div>
                  )}
                </>
              )}

              {(requestType === RequestType.OVERTIME ||
                requestType === RequestType.UNDERTIME) && (
                <>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Controller
                      name="hours"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="hours"
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="date"
                          type="date"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="reason"
                      placeholder="Provide details for your request"
                      {...field}
                    />
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestHistoryData.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium capitalize">
                    {request.type.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{request.description}</TableCell>
                  <TableCell>{request.submittedDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeRequests;
