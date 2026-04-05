import React from 'react';
import { Badge } from '../../../../../components/ui/badge';
import { Card, CardContent } from '../../../../../components/ui/card';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import type { EmployeeRequestRecord, EmployeeRequestType } from '../../shared/employeePortalTypes';
import { formatDateTimeLabel } from '../../shared/employeePortalUtils';
import { statusBadgeClass, statusLabel } from '../../../admin/requests/utils';
import { REQUEST_FORM_SCHEMAS, getRequestTypeLabel } from '../requestConfig';

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
  const detailFields = REQUEST_FORM_SCHEMAS[requestType];

  return (
    <div className="rounded-sm border">
      <ScrollArea className="h-107.5 w-full p-4">
        {requests.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No requests found for the selected type and month.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="py-4">
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{getRequestTypeLabel(request.type)} Request</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {formatDateTimeLabel(request.submittedAt)}
                      </p>
                    </div>

                    <Badge className={statusBadgeClass[request.status]}>{statusLabel[request.status]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{request.summary}</p>

                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                    {detailFields.map((field) => (
                      <div key={`${request.id}-${field.key}`} className="rounded-sm bg-muted/40 p-2">
                        <p className="font-medium text-muted-foreground">{field.label}</p>
                        <p className="mt-1 wrap-break-word">{toDisplayValue(request.fields[field.key])}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default RequestListPanel;
