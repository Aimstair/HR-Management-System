'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
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
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { AttendanceStatus } from '../../types/index';

interface AttendanceLog {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  hoursWorked: number;
}

const attendanceLogs: AttendanceLog[] = [
  {
    id: '1',
    date: '2024-03-11',
    clockIn: '08:00 AM',
    clockOut: '04:30 PM',
    status: AttendanceStatus.PRESENT,
    hoursWorked: 8.5,
  },
  {
    id: '2',
    date: '2024-03-10',
    clockIn: '08:15 AM',
    clockOut: '04:45 PM',
    status: AttendanceStatus.LATE,
    hoursWorked: 8.5,
  },
  {
    id: '3',
    date: '2024-03-09',
    clockIn: '08:00 AM',
    clockOut: '03:00 PM',
    status: AttendanceStatus.EARLY_LEAVE,
    hoursWorked: 7,
  },
  {
    id: '4',
    date: '2024-03-08',
    clockIn: '08:05 AM',
    clockOut: '04:30 PM',
    status: AttendanceStatus.PRESENT,
    hoursWorked: 8.4,
  },
  {
    id: '5',
    date: '2024-03-07',
    clockIn: '--',
    clockOut: '--',
    status: AttendanceStatus.ABSENT,
    hoursWorked: 0,
  },
  {
    id: '6',
    date: '2024-03-06',
    clockIn: '08:00 AM',
    clockOut: '04:30 PM',
    status: AttendanceStatus.PRESENT,
    hoursWorked: 8.5,
  },
  {
    id: '7',
    date: '2024-03-05',
    clockIn: '08:00 AM',
    clockOut: '04:30 PM',
    status: AttendanceStatus.PRESENT,
    hoursWorked: 8.5,
  },
];

const EmployeeAttendance: React.FC = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleClockToggle = () => {
    const newState = !isClockedIn;
    setIsClockedIn(newState);
    if (newState) {
      toast.success('Clocked in successfully');
    } else {
      toast.success('Clocked out successfully');
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'bg-primary/10 text-primary',
      [AttendanceStatus.ABSENT]: 'bg-destructive/10 text-destructive',
      [AttendanceStatus.LATE]: 'bg-secondary/20 text-secondary-foreground',
      [AttendanceStatus.EARLY_LEAVE]: 'bg-secondary/20 text-secondary-foreground',
      [AttendanceStatus.ON_LEAVE]: 'bg-muted text-muted-foreground',
    };
    return variants[status];
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    const labels: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: 'Present',
      [AttendanceStatus.ABSENT]: 'Absent',
      [AttendanceStatus.LATE]: 'Late',
      [AttendanceStatus.EARLY_LEAVE]: 'Early Leave',
      [AttendanceStatus.ON_LEAVE]: 'On Leave',
    };
    return labels[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Button
          onClick={handleClockToggle}
          variant={isClockedIn ? 'destructive' : 'default'}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Current Status: <span className="font-semibold">{isClockedIn ? 'Clocked In' : 'Clocked Out'}</span>
          </p>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{log.clockIn}</TableCell>
                  <TableCell>{log.clockOut}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(log.status)}>
                      {getStatusLabel(log.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{log.hoursWorked}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
