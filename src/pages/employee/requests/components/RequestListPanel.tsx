import React from 'react';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import type { EmployeeRequestRecord, EmployeeRequestType } from '../../shared/employeePortalTypes';
import { statusBadgeClass, statusLabel, buildDurationLabel, formatDateTime } from '../../../admin/requests/utils';
import { getRequestTypeLabel } from '../requestConfig';

const REQUESTS_ROWS_PER_PAGE = 9;
const REQUESTS_ROW_HEIGHT_CLASS = 'h-14';

interface RequestListPanelProps {
  requestType: EmployeeRequestType;
  requests: EmployeeRequestRecord[];
}

const scheduleCell = (from?: string | null, to?: string | null): React.ReactNode => (
  <div className="space-y-0.5 text-[12px] leading-tight">
    <p className="truncate">From: {formatDateTime(from || undefined)}</p>
    <p className="truncate">To: {formatDateTime(to || undefined)}</p>
  </div>
);

const RequestListPanel: React.FC<RequestListPanelProps> = ({ requestType, requests }) => {
  const [page, setPage] = React.useState<number>(1);

  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(requests.length / REQUESTS_ROWS_PER_PAGE));
  }, [requests.length]);

  React.useEffect(() => {
    setPage(1);
  }, [requestType]);

  React.useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const paginatedRequests = React.useMemo(() => {
    const startIndex = (page - 1) * REQUESTS_ROWS_PER_PAGE;
    return requests.slice(startIndex, startIndex + REQUESTS_ROWS_PER_PAGE);
  }, [page, requests]);

  const emptyRows = REQUESTS_ROWS_PER_PAGE - paginatedRequests.length;
  const hasNoRequests = requests.length === 0;

  const minimumTableWidth = 1100;

  return (
    <div className="space-y-3 rounded-sm">
      <div className="border-b">
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: `${minimumTableWidth}px` }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Request Date</TableHead>
                  <TableHead className="w-36">Type</TableHead>
                  <TableHead className="min-w-64">Notes</TableHead>
                  <TableHead className="w-32">Duration</TableHead>
                  <TableHead className="min-w-56">Schedule</TableHead>
                  <TableHead className="min-w-44">Remarks</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id} className={REQUESTS_ROW_HEIGHT_CLASS}>
                    <TableCell className="align-middle text-[12px] leading-tight">
                      {formatDateTime(request.submittedAt)}
                    </TableCell>
                    <TableCell className="align-middle text-[12px]">
                      {getRequestTypeLabel(request.type)}
                    </TableCell>
                    <TableCell 
                      className="max-w-64 truncate align-middle text-[12px] text-muted-foreground" 
                      title={String(request.fields.reason || request.fields.notes || request.summary || 'N/A')}
                    >
                      {String(request.fields.reason || request.fields.notes || request.summary || 'N/A')}
                    </TableCell>
                    <TableCell className="align-middle text-[12px] leading-tight">
                      <span className="truncate">{buildDurationLabel(request.scheduleFrom, request.scheduleTo) || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="align-middle text-[12px] leading-tight">
                      {scheduleCell(request.scheduleFrom, request.scheduleTo)}
                    </TableCell>
                    <TableCell className="max-w-44 truncate align-middle text-[12px] leading-tight text-muted-foreground" title={request.remarks || ''}>
                      {request.remarks || '—'}
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge className={statusBadgeClass[request.status]}>{statusLabel[request.status]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {Array.from({ length: emptyRows }, (_, index) => (
                  <TableRow key={`empty-${index}`} className={REQUESTS_ROW_HEIGHT_CLASS}>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">--</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 px-4">
        <p className="text-xs text-muted-foreground">
          {hasNoRequests
            ? 'No requests found for the selected type and month.'
            : `Showing ${(page - 1) * REQUESTS_ROWS_PER_PAGE + 1}-${Math.min(page * REQUESTS_ROWS_PER_PAGE, requests.length)} of ${requests.length} requests`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <p className="min-w-20 text-center text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestListPanel;
