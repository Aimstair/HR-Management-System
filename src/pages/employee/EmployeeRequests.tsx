import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
} from '../../../components/ui/card';
import RequestFiltersBar from './requests/components/RequestFiltersBar';
import RequestFilingDialog from './requests/components/RequestFilingDialog';
import RequestListPanel from './requests/components/RequestListPanel';
import RequestStatsCards from './requests/components/RequestStatsCards';
import { getAvailableRequestTypeOptions, getRequestTypeLabel } from './requests/requestConfig';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import { useAuth } from '../../context/AuthContext';
import { EmployeeType } from '../../types';
import type { EmployeeRequestType } from './shared/employeePortalTypes';
import {
  filterRequestsByMonthAndType,
  filterRequestsBySearch,
  getCurrentMonthKey,
  getRequestStats,
} from './shared/employeePortalUtils';

const EmployeeRequests: React.FC = () => {
  const { user } = useAuth();
  const { requests, submitRequest } = useEmployeePortal();
  const [searchParams] = useSearchParams();
  const [activeType, setActiveType] = React.useState<EmployeeRequestType>('leave');
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonthKey());
  const [search, setSearch] = React.useState<string>('');
  const [isFilingOpen, setIsFilingOpen] = React.useState<boolean>(false);
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;

  const requestTypeOptions = React.useMemo(
    () => getAvailableRequestTypeOptions(employeeType),
    [employeeType],
  );

  // Links (e.g. from the dashboard) can preselect the request type and month.
  const linkedType = searchParams.get('type');
  const linkedMonth = searchParams.get('month');
  React.useEffect(() => {
    if (linkedType && requestTypeOptions.some((option) => option.value === linkedType)) {
      setActiveType(linkedType as EmployeeRequestType);
    }
    if (linkedMonth && /^\d{4}-\d{2}$/.test(linkedMonth)) {
      setSelectedMonth(linkedMonth);
    }
  }, [linkedMonth, linkedType, requestTypeOptions]);

  React.useEffect(() => {
    const allowedTypes = new Set(requestTypeOptions.map((option) => option.value));
    if (!allowedTypes.has(activeType)) {
      setActiveType(requestTypeOptions[0]?.value ?? 'attendance');
    }
  }, [activeType, requestTypeOptions]);

  const scopedRequests = React.useMemo(() => {
    return filterRequestsByMonthAndType(requests, selectedMonth, activeType).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }, [activeType, requests, selectedMonth]);

  const visibleRequests = React.useMemo(() => {
    return filterRequestsBySearch(scopedRequests, search);
  }, [scopedRequests, search]);

  const requestStats = React.useMemo(() => {
    return getRequestStats(scopedRequests);
  }, [scopedRequests]);

  const handleSubmitRequest = React.useCallback(
    async (fields: Record<string, string | number | string[] | null>) => {
      try {
        await submitRequest({
          type: activeType,
          fields,
        });

        setIsFilingOpen(false);
        toast.success(`${getRequestTypeLabel(activeType)} request filed successfully.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Please try again.';
        toast.error(`Unable to file request: ${message}`);
      }
    },
    [activeType, submitRequest],
  );

  return (
    <div className="space-y-4">
      {/* <RequestTypeMenu activeType={activeType} options={requestTypeOptions} onChange={setActiveType} /> */}

      <RequestStatsCards totals={requestStats} />

      <RequestFiltersBar
        month={selectedMonth}
        search={search}
        onMonthChange={setSelectedMonth}
        onSearchChange={setSearch}
        onOpenCreate={() => setIsFilingOpen(true)}
        activeType={activeType} 
        options={requestTypeOptions} 
        onChange={setActiveType}
      />

      <Card className="py-0">
          <RequestListPanel requestType={activeType} requests={visibleRequests} />
      </Card>

      <RequestFilingDialog
        open={isFilingOpen}
        requestType={activeType}
        employeeType={employeeType}
        onClose={() => setIsFilingOpen(false)}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
};

export default EmployeeRequests;
