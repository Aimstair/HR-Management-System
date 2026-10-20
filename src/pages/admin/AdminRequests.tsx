'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Textarea } from '../../../components/ui/textarea';
import { RequestStatus } from '../../types';
import { bulkUpdateAdminRequestStatus, getAdminRequests, getAdminOrganizationCampuses, updateAdminRequestStatus } from '../../lib/admin-api';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import RequestDataTable from './requests/components/RequestDataTable';
import RequestMassActions from './requests/components/RequestMassActions';
import RequestSearch from './requests/components/RequestSearch';
import { getColumnsByCategory } from './requests/columns';
import type { RequestCategory, RequestRecord, SortState } from './requests/types';
import {
  filterRequestsBySearch,
  mapCategoryToApiRequestType,
  mapRequestStatusToApiStatus,
  REQUEST_CATEGORY_MENU,
  statusBadgeClass,
  statusLabel,
  toRequestRecord,
} from './requests/utils';

const PAGE_SIZE = 9;
type DateFilterMode = 'all' | 'today' | 'specific' | 'range';

const toStartOfDayIso = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};

const toEndOfDayIso = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};

const buildDateRange = (
  mode: DateFilterMode,
  date: string,
  from: string,
  to: string,
): { from?: string; to?: string } => {
  if (mode === 'today') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (mode === 'specific') {
    return { from: toStartOfDayIso(date), to: toEndOfDayIso(date) };
  }

  if (mode === 'range') {
    return { from: toStartOfDayIso(from), to: toEndOfDayIso(to) };
  }

  return {};
};

const AdminRequests: React.FC = () => {
  const { user } = useAuth();
  const isHeadHr = user?.role === UserRole.HEAD_HR;
  
  const [activeCategory, setActiveCategory] = useState<RequestCategory>('leave');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>({ key: 'employee', direction: 'asc' });
  const [requestDateMode, setRequestDateMode] = useState<DateFilterMode>('all');
  const [requestDate, setRequestDate] = useState<string>('');
  const [requestDateFrom, setRequestDateFrom] = useState<string>('');
  const [requestDateTo, setRequestDateTo] = useState<string>('');
  const [scheduleDateMode, setScheduleDateMode] = useState<DateFilterMode>('all');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleDateFrom, setScheduleDateFrom] = useState<string>('');
  const [scheduleDateTo, setScheduleDateTo] = useState<string>('');
  const [massActionType, setMassActionType] = useState<'approve' | 'decline' | null>(null);
  const [massActionRemarks, setMassActionRemarks] = useState<string>('');
  
  const [campuses, setCampuses] = useState<Array<{ id: string; name: string }>>([]);
  const [campusFilter, setCampusFilter] = useState<string>('all');

  useEffect(() => {
    let isCurrent = true;
    void getAdminOrganizationCampuses().then((response) => {
      if (isCurrent) {
        setCampuses(response.campuses.map(c => ({ id: c.id, name: c.name })));
      }
    }).catch(() => {
      // Ignore
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const hasServerSearch = search.trim().length > 0;

  const filteredRequests = useMemo(() => {
    return filterRequestsBySearch(requests, search, hasServerSearch);
  }, [requests, search, hasServerSearch]);

  const updateRequestStatus = useCallback(
    async (ids: string[], nextStatus: RequestStatus, remarks?: string): Promise<void> => {
      if (ids.length === 0 || isUpdating) {
        return;
      }

      setIsUpdating(true);

      const normalizedRemarks = remarks?.trim();

      try {
        const updated = ids.length === 1
          ? await updateAdminRequestStatus(
              ids[0],
              mapRequestStatusToApiStatus(nextStatus),
              normalizedRemarks ? normalizedRemarks : null,
            ).then((response) => [response.request]
              .map(toRequestRecord)
              .filter((record): record is RequestRecord => Boolean(record)))
          : await bulkUpdateAdminRequestStatus(
            ids,
            mapRequestStatusToApiStatus(nextStatus),
            normalizedRemarks ? normalizedRemarks : null,
          )
            .then((response) => response.requests
              .map(toRequestRecord)
              .filter((record): record is RequestRecord => Boolean(record)));

        if (updated.length > 0) {
          const updatedMap = new Map(updated.map((item) => [item.id, item]));
          setRequests((current) => current.map((request) => updatedMap.get(request.id) ?? request));
          setRemarksById((current) => {
            const next = { ...current };
            updated.forEach((request) => {
              next[request.id] = request.remarks ?? '';
            });
            return next;
          });
        }

        setSelectedIds((current) => {
          const next = new Set(current);
          ids.forEach((id) => next.delete(id));
          return next;
        });

        const label =
          nextStatus === RequestStatus.APPROVED
            ? 'approved'
            : nextStatus === RequestStatus.REJECTED
              ? 'declined'
              : 'cancelled';
        const updatedCount = updated.length > 0 ? updated.length : ids.length;
        toast.success(`${updatedCount} request(s) ${label}.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to update request status.';
        toast.error(message);
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating, mapRequestStatusToApiStatus, toRequestRecord],
  );

  const columns = useMemo(() => {
    const baseColumns = getColumnsByCategory(activeCategory);
    return [
      ...baseColumns,
      {
        id: 'remarks',
        label: 'Remark',
        className: 'min-w-[220px] max-w-[220px]',
        render: (request: RequestRecord) => {
          if (request.status !== RequestStatus.PENDING) {
            return (
              <p className="truncate text-[12px] leading-tight text-muted-foreground">
                {request.remarks || '—'}
              </p>
            );
          }

          return (
            <Input
              value={remarksById[request.id] ?? ''}
              onChange={(event) =>
                setRemarksById((current) => ({ ...current, [request.id]: event.target.value }))
              }
              placeholder="Add remark"
              className="h-8 text-[12px]"
              disabled={isUpdating}
            />
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        className: 'min-w-[120px] max-w-[120px]',
        render: (request: RequestRecord) => (
          <Badge className={`border ${statusBadgeClass[request.status]}`}>{statusLabel[request.status]}</Badge>
        ),
        sortValue: (request: RequestRecord) => statusLabel[request.status],
      },
      {
        id: 'actions',
        label: 'Actions',
        className: 'min-w-[160px] max-w-[160px]',
        render: (request: RequestRecord) => {
          const isPending = request.status === RequestStatus.PENDING;
          const remark = remarksById[request.id] ?? '';
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" disabled={isUpdating}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={!isPending || isUpdating}
                  onClick={() => updateRequestStatus([request.id], RequestStatus.APPROVED, remark)}
                >
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!isPending || isUpdating}
                  onClick={() => updateRequestStatus([request.id], RequestStatus.REJECTED, remark)}
                >
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, [activeCategory, isUpdating, remarksById, updateRequestStatus]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [
    activeCategory,
    search,
    statusFilter,
    requestDateMode,
    requestDate,
    requestDateFrom,
    requestDateTo,
    scheduleDateMode,
    scheduleDate,
    scheduleDateFrom,
    scheduleDateTo,
    campusFilter,
  ]);

  useEffect(() => {
    setRemarksById((current) => {
      const next: Record<string, string> = {};
      requests.forEach((request) => {
        next[request.id] = current[request.id] ?? request.remarks ?? '';
      });
      return next;
    });
  }, [requests]);

  useEffect(() => {
    const apiType = mapCategoryToApiRequestType(activeCategory);
    if (!apiType) {
      setRequests([]);
      setTotalPages(1);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isCurrent = true;

    setIsLoading(true);
    setError(null);

    const apiStatus = statusFilter === 'all' ? undefined : mapRequestStatusToApiStatus(statusFilter);
    const requestDateRange = buildDateRange(requestDateMode, requestDate, requestDateFrom, requestDateTo);
    const scheduleDateRange = buildDateRange(scheduleDateMode, scheduleDate, scheduleDateFrom, scheduleDateTo);

    void getAdminRequests({
      type: apiType,
      status: apiStatus,
      schoolId: campusFilter === 'all' ? undefined : campusFilter,
      search: search.trim() || undefined,
      requestDateFrom: requestDateRange.from,
      requestDateTo: requestDateRange.to,
      scheduleFrom: scheduleDateRange.from,
      scheduleTo: scheduleDateRange.to,
      page,
      limit: PAGE_SIZE,
    })
      .then((response) => {
        if (!isCurrent) {
          return;
        }

        const mappedRows = response.rows
          .map(toRequestRecord)
          .filter((record): record is RequestRecord => Boolean(record));

        setRequests(mappedRows);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err: unknown) => {
        if (!isCurrent) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load requests.';
        setError(message);
        setRequests([]);
        setTotalPages(1);
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [
    activeCategory,
    search,
    page,
    refreshKey,
    statusFilter,
    requestDateMode,
    requestDate,
    requestDateFrom,
    requestDateTo,
    scheduleDateMode,
    scheduleDate,
    scheduleDateFrom,
    scheduleDateTo,
    campusFilter,
  ]);

  const handleToggleAllVisible = (checked: boolean, visibleIds: string[]): void => {
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleToggleOne = (id: string, checked: boolean): void => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const applyMassStatus = async (nextStatus: RequestStatus, remarks?: string): Promise<void> => {
    await updateRequestStatus(Array.from(selectedIds), nextStatus, remarks);
  };

  const handleCategoryChange = (category: RequestCategory): void => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string): void => {
    setStatusFilter(value === 'all' ? 'all' : (value as RequestStatus));
    setPage(1);
  };

  const handleRequestDateModeChange = (value: string): void => {
    const nextMode = value as DateFilterMode;
    setRequestDateMode(nextMode);
    setPage(1);
    if (nextMode === 'all') {
      setRequestDate('');
      setRequestDateFrom('');
      setRequestDateTo('');
    }
  };

  const handleScheduleDateModeChange = (value: string): void => {
    const nextMode = value as DateFilterMode;
    setScheduleDateMode(nextMode);
    setPage(1);
    if (nextMode === 'all') {
      setScheduleDate('');
      setScheduleDateFrom('');
      setScheduleDateTo('');
    }
  };

  const openMassAction = (type: 'approve' | 'decline'): void => {
    setMassActionType(type);
    setMassActionRemarks('');
  };

  const closeMassAction = (): void => {
    setMassActionType(null);
    setMassActionRemarks('');
  };

  const confirmMassAction = async (): Promise<void> => {
    if (!massActionType) {
      return;
    }

    const remarks = massActionRemarks.trim();
    if (!remarks) {
      toast.error('Enter remarks before submitting this action.');
      return;
    }

    const nextStatus = massActionType === 'approve' ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    await applyMassStatus(nextStatus, remarks);
    closeMassAction();
  };

  return (
    <div className="space-y-4">

      <div className="rounded-lg border p-3 flex flex-row justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {REQUEST_CATEGORY_MENU.map((menu) => (
            <Button
              key={menu.value}
              variant={activeCategory === menu.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(menu.value)}
            >
              {menu.label}
            </Button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={RequestStatus.PENDING}>{statusLabel[RequestStatus.PENDING]}</SelectItem>
              <SelectItem value={RequestStatus.APPROVED}>{statusLabel[RequestStatus.APPROVED]}</SelectItem>
              <SelectItem value={RequestStatus.REJECTED}>{statusLabel[RequestStatus.REJECTED]}</SelectItem>
              <SelectItem value={RequestStatus.CANCELLED}>{statusLabel[RequestStatus.CANCELLED]}</SelectItem>
            </SelectContent>
          </Select>

          {isHeadHr && campuses.length > 0 && (
            <Select value={campusFilter} onValueChange={(val) => { setCampusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-45">
                <SelectValue placeholder="All Campuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                {campuses.map(campus => (
                  <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <RequestSearch value={search} onChange={handleSearchChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border p-3 space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Request Date</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={requestDateMode} onValueChange={handleRequestDateModeChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Request date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="specific">Specific date</SelectItem>
                <SelectItem value="range">Date range</SelectItem>
              </SelectContent>
            </Select>

            {requestDateMode === 'specific' ? (
              <Input
                type="date"
                value={requestDate}
                onChange={(event) => {
                  setRequestDate(event.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-48"
              />
            ) : null}

            {requestDateMode === 'range' ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  value={requestDateFrom}
                  onChange={(event) => {
                    setRequestDateFrom(event.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48"
                />
                <Input
                  type="date"
                  value={requestDateTo}
                  onChange={(event) => {
                    setRequestDateTo(event.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <Label className="text-xs uppercase text-muted-foreground">Schedule Date</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scheduleDateMode} onValueChange={handleScheduleDateModeChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Schedule date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="specific">Specific date</SelectItem>
                <SelectItem value="range">Date range</SelectItem>
              </SelectContent>
            </Select>

            {scheduleDateMode === 'specific' ? (
              <Input
                type="date"
                value={scheduleDate}
                onChange={(event) => {
                  setScheduleDate(event.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-48"
              />
            ) : null}

            {scheduleDateMode === 'range' ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  value={scheduleDateFrom}
                  onChange={(event) => {
                    setScheduleDateFrom(event.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48"
                />
                <Input
                  type="date"
                  value={scheduleDateTo}
                  onChange={(event) => {
                    setScheduleDateTo(event.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="p-0 h-full">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading requests...</div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">
            <p>{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setRefreshKey((key) => key + 1)}>
              Retry
            </Button>
          </div>
        ) : (
          <RequestDataTable
            columns={columns}
            rows={filteredRequests}
            selectedIds={selectedIds}
            onToggleAllVisible={handleToggleAllVisible}
            onToggleOne={handleToggleOne}
            sort={sort}
            onSortChange={setSort}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
          />
        )}
      </Card>
      <RequestMassActions
        selectedCount={selectedIds.size}
        onApprove={() => openMassAction('approve')}
        onDecline={() => openMassAction('decline')}
        onCancel={() => applyMassStatus(RequestStatus.CANCELLED)}
        isProcessing={isUpdating}
      />

      <Dialog open={massActionType !== null} onOpenChange={(open) => (!open ? closeMassAction() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {massActionType === 'approve' ? 'Approve selected requests' : 'Decline selected requests'}
            </DialogTitle>
            <DialogDescription>
              Add a remark that will be applied to all selected requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={massActionRemarks}
              onChange={(event) => setMassActionRemarks(event.target.value)}
              placeholder="Enter reason for this action"
              rows={4}
              disabled={isUpdating}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeMassAction} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={massActionType === 'decline' ? 'destructive' : 'default'}
              onClick={() => void confirmMassAction()}
              disabled={isUpdating}
            >
              {massActionType === 'approve' ? 'Approve' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
