import React from 'react';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import type { EmployeeRequestRecord, EmployeeRequestType } from '../../shared/employeePortalTypes';
import { formatDateTimeLabel } from '../../shared/employeePortalUtils';
import { statusBadgeClass, statusLabel } from '../../../admin/requests/utils';
import { getRequestFormSchema, getRequestTypeLabel } from '../requestConfig';
import { useAuth } from '../../../../context/AuthContext';
import { EmployeeType } from '../../../../types';

const REQUESTS_ROWS_PER_PAGE = 9;
const REQUESTS_ROW_HEIGHT_CLASS = 'h-14';

interface RequestListPanelProps {
  requestType: EmployeeRequestType;
  requests: EmployeeRequestRecord[];
}

const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'N/A';
  }

  return String(value);
};

const RequestListPanel: React.FC<RequestListPanelProps> = ({ requestType, requests }) => {
  const { user } = useAuth();
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;
  const detailFields = getRequestFormSchema(requestType, employeeType);

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

  const minimumTableWidth = Math.max(980, 520 + detailFields.length * 180);

  return (
    <div className="space-y-3 rounded-sm">
      <div className=" border-b">
        <ScrollArea className="w-full">
          <div style={{ minWidth: `${minimumTableWidth}px` }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-38">Submitted</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-36">Type</TableHead>
                  <TableHead className="min-w-72">Summary</TableHead>
                  {detailFields.map((field) => (
                    <TableHead key={field.key} className="min-w-44">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id} className={REQUESTS_ROW_HEIGHT_CLASS}>
                    <TableCell className="align-middle text-xs">{formatDateTimeLabel(request.submittedAt)}</TableCell>
                    <TableCell className="align-middle">
                      <Badge className={statusBadgeClass[request.status]}>{statusLabel[request.status]}</Badge>
                    </TableCell>
                    <TableCell className="align-middle text-xs">{getRequestTypeLabel(request.type)}</TableCell>
                    <TableCell className="max-w-72 truncate align-middle text-xs" title={request.summary}>
                      {request.summary || 'N/A'}
                    </TableCell>
                    {detailFields.map((field) => {
                      const value = toDisplayValue(request.fields[field.key]);

                      return (
                        <TableCell
                          key={`${request.id}-${field.key}`}
                          className="max-w-72 truncate align-middle text-xs"
                          title={value}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {Array.from({ length: emptyRows }, (_, index) => (
                  <TableRow key={`empty-${index}`} className={REQUESTS_ROW_HEIGHT_CLASS}>
                    <TableCell className="text-xs text-muted-foreground">--</TableCell>
                    <TableCell className="text-xs text-muted-foreground">--</TableCell>
                    <TableCell className="text-xs text-muted-foreground">--</TableCell>
                    <TableCell className="text-xs text-muted-foreground">--</TableCell>
                    {detailFields.map((field) => (
                      <TableCell key={`empty-${index}-${field.key}`} className="text-xs text-muted-foreground">
                        --
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
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
