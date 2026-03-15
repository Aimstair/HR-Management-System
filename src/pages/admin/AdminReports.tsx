'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarRange, MessageSquareText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

type AttendanceIssueStatus = 'Late' | 'Absent';

interface AttendanceReportRow {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  status: AttendanceIssueStatus;
  remarks: string;
}

interface FinancialReportRow {
  department: string;
  totalRequested: number;
}

interface EvaluationReportRow {
  id: string;
  professorName: string;
  subject: string;
  averageScore: number;
}

const attendanceRows: AttendanceReportRow[] = [
  {
    id: 'ATT-001',
    employeeName: 'John Smith',
    department: 'Science',
    date: '2026-03-11',
    status: 'Late',
    remarks: '14 minutes late due to heavy traffic.',
  },
  {
    id: 'ATT-002',
    employeeName: 'Sarah Johnson',
    department: 'Mathematics',
    date: '2026-03-11',
    status: 'Absent',
    remarks: 'No check-in record and no leave request filed.',
  },
  {
    id: 'ATT-003',
    employeeName: 'Michael Chen',
    department: 'Science',
    date: '2026-03-10',
    status: 'Late',
    remarks: '9 minutes late.',
  },
  {
    id: 'ATT-004',
    employeeName: 'Emma Davis',
    department: 'English',
    date: '2026-03-09',
    status: 'Absent',
    remarks: 'Absent, pending attendance adjustment.',
  },
  {
    id: 'ATT-005',
    employeeName: 'Carlos Mendoza',
    department: 'Operations',
    date: '2026-03-08',
    status: 'Late',
    remarks: '22 minutes late due to transport disruption.',
  },
];

const financialRows: FinancialReportRow[] = [
  { department: 'Science', totalRequested: 64200 },
  { department: 'Mathematics', totalRequested: 35800 },
  { department: 'English', totalRequested: 18400 },
  { department: 'Operations', totalRequested: 42100 },
  { department: 'Registrar', totalRequested: 22600 },
  { department: 'Finance', totalRequested: 27800 },
];

const evaluationRows: EvaluationReportRow[] = [
  { id: 'EVAL-001', professorName: 'Dr. Robert Wilson', subject: 'World History', averageScore: 4.9 },
  { id: 'EVAL-002', professorName: 'Prof. Sarah Johnson', subject: 'Advanced Mathematics', averageScore: 4.8 },
  { id: 'EVAL-003', professorName: 'Dr. Michael Chen', subject: 'Physics', averageScore: 4.7 },
  { id: 'EVAL-004', professorName: 'Prof. Emma Davis', subject: 'English Literature', averageScore: 4.6 },
  { id: 'EVAL-005', professorName: 'Dr. John Martinez', subject: 'Chemistry', averageScore: 4.5 },
];

const AdminReports: React.FC = () => {
  const [selectedProfessor, setSelectedProfessor] = useState<EvaluationReportRow | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState<boolean>(false);

  const rankedEvaluations = useMemo(() => {
    return [...evaluationRows].sort((a, b) => b.averageScore - a.averageScore);
  }, []);

  const openFeedbackDialog = (professor: EvaluationReportRow): void => {
    setSelectedProfessor(professor);
    setIsFeedbackDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Admin Reports Hub</h1>
        <p className="text-sm text-muted-foreground">
          Unified analytics for attendance, financial requests, and faculty performance.
        </p>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance & Tardiness</CardTitle>
              <CardDescription>
                Employees flagged as late or absent for selected reporting periods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <CalendarRange className="h-4 w-4" />
                Date Range Picker placeholder (From Date - To Date)
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.employeeName}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              row.status === 'Late'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>
                Total funds and expense requests grouped by department.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `PHP ${value.toLocaleString()}`} />
                    <Bar dataKey="totalRequested" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Evaluations</CardTitle>
              <CardDescription>
                Ranked faculty list by average student evaluation score.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professor Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead className="w-[160px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedEvaluations.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.professorName}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.averageScore.toFixed(1)} / 5.0</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openFeedbackDialog(row)}>
                            <MessageSquareText className="h-4 w-4" />
                            View Feedback
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              {selectedProfessor
                ? `Feedback breakdown for ${selectedProfessor.professorName} (${selectedProfessor.subject}).`
                : 'No professor selected.'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            Dummy modal content: qualitative student feedback comments and category scores
            will be displayed here in a future iteration.
          </div>

          <DialogFooter>
            <Button onClick={() => setIsFeedbackDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
