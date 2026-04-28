import React from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import RequestFiltersBar from './requests/components/RequestFiltersBar';
import RequestFilingDialog from './requests/components/RequestFilingDialog';
import RequestListPanel from './requests/components/RequestListPanel';
import RequestStatsCards from './requests/components/RequestStatsCards';
import RequestTypeMenu from './requests/components/RequestTypeMenu';
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
  const [activeType, setActiveType] = React.useState<EmployeeRequestType>('attendance');
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonthKey());
  const [search, setSearch] = React.useState<string>('');
  const [isFilingOpen, setIsFilingOpen] = React.useState<boolean>(false);
  const employeeType = user?.employeeType ?? EmployeeType.NON_TEACHING;

  const requestTypeOptions = React.useMemo(
    () => getAvailableRequestTypeOptions(employeeType),
    [employeeType],
  );

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
    (fields: Record<string, string | number | string[] | null>) => {
      submitRequest({
        type: activeType,
        fields,
      });

      setIsFilingOpen(false);
      toast.success(`${getRequestTypeLabel(activeType)} request filed successfully.`);
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
