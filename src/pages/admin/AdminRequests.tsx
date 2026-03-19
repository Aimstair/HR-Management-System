'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { RequestStatus } from '../../types';
import RequestDataTable from './requests/components/RequestDataTable';
import RequestMassActions from './requests/components/RequestMassActions';
import RequestSearch from './requests/components/RequestSearch';
import { getColumnsByCategory } from './requests/columns';
import { initialRequests } from './requests/mockData';
import type { RequestCategory, RequestRecord } from './requests/types';
import { filterRequestsBySearch, REQUEST_CATEGORY_MENU } from './requests/utils';

const AdminRequests: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<RequestCategory>('leave');
  const [search, setSearch] = useState<string>('');
  const [requests, setRequests] = useState<RequestRecord[]>(initialRequests);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const requestsByCategory = useMemo(() => {
    return requests.filter((request) => request.category === activeCategory);
  }, [requests, activeCategory]);

  const filteredRequests = useMemo(() => {
    return filterRequestsBySearch(requestsByCategory, search);
  }, [requestsByCategory, search]);

  const columns = useMemo(() => getColumnsByCategory(activeCategory), [activeCategory]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeCategory, search]);

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

  const applyMassStatus = (nextStatus: RequestStatus): void => {
    if (selectedIds.size === 0) {
      return;
    }

    setRequests((current) =>
      current.map((request) => (selectedIds.has(request.id) ? { ...request, status: nextStatus } : request)),
    );

    const label =
      nextStatus === RequestStatus.APPROVED
        ? 'approved'
        : nextStatus === RequestStatus.REJECTED
          ? 'declined'
          : 'cancelled';
    toast.success(`${selectedIds.size} request(s) ${label}.`);
    setSelectedIds(new Set());
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
              onClick={() => setActiveCategory(menu.value)}
            >
              {menu.label}
            </Button>
          ))}
        </div>

        <RequestSearch value={search} onChange={setSearch} />
      </div>

      <Card className="p-0 h-full">
        <RequestDataTable
          columns={columns}
          rows={filteredRequests}
          selectedIds={selectedIds}
          onToggleAllVisible={handleToggleAllVisible}
          onToggleOne={handleToggleOne}
        />
      </Card>
          <RequestMassActions
            selectedCount={selectedIds.size}
            onApprove={() => applyMassStatus(RequestStatus.APPROVED)}
            onDecline={() => applyMassStatus(RequestStatus.REJECTED)}
            onCancel={() => applyMassStatus(RequestStatus.CANCELLED)}
          />
    </div>
  );
};

export default AdminRequests;
