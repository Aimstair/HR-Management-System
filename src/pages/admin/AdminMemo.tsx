import React, { useCallback, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import MemoCard from './memo/components/MemoCard';
import MemoCreateDialog from './memo/components/MemoCreateDialog';
import MemoDetailDialog from './memo/components/MemoDetailDialog';
import MemoFilters from './memo/components/MemoFilters';
import { memoTypeOptions, recipientTypeOptions } from './memo/mockData';
import type { MemoFilterState, MemoItem, RecipientType } from './memo/types';
import { filterMemos, inferMemoStatus } from './memo/utils';
import {
  createAdminMemo,
  getAdminEmployees,
  getAdminMemos,
  getAdminOrganizationCampuses,
} from '../../lib/admin-api';

const defaultFilterState: MemoFilterState = {
  search: '',
  status: 'all',
  timeFilter: 'month',
  selectedMonth: String(new Date().getMonth()),
  selectedYear: String(new Date().getFullYear()),
  rangeStart: '',
  rangeEnd: '',
};

const AdminMemo: React.FC = () => {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [filters, setFilters] = useState<MemoFilterState>(defaultFilterState);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);
  const [recipientPool, setRecipientPool] = useState<{
    Campus: Array<{ id: string; name: string; meta?: string }>;
    School: Array<{ id: string; name: string; meta?: string }>;
    Department: Array<{ id: string; name: string; meta?: string }>;
    Employees: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
  }>({
    Campus: [],
    School: [],
    Department: [],
    Employees: [],
  });

  const normalizeStatus = useCallback((memo: MemoItem): MemoItem => {
    if (memo.status) {
      return memo;
    }

    return {
      ...memo,
      status: inferMemoStatus(memo.effectiveDate),
    };
  }, []);

  const loadMemos = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdminMemos();
      setMemos(response.memos.map(normalizeStatus));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load memos.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeStatus]);

  const loadRecipients = useCallback(async (): Promise<void> => {
    try {
      const [campusResponse, employeeResponse] = await Promise.all([
        getAdminOrganizationCampuses(),
        (async () => {
          const rows = [] as Awaited<ReturnType<typeof getAdminEmployees>>['rows'];
          let page = 1;
          let totalPages = 1;

          do {
            const response = await getAdminEmployees({ page, limit: 200 });
            rows.push(...response.rows);
            totalPages = response.pagination.totalPages;
            page += 1;
          } while (page <= totalPages);

          return rows;
        })(),
      ]);

      const campusRecipients = campusResponse.campuses.map((campus) => ({
        id: campus.id,
        name: campus.name,
      }));

      const schoolRecipients = campusResponse.campuses.flatMap((campus) =>
        campus.teachingSchools.map((school) => ({
          id: school.id,
          name: school.name,
          meta: campus.name,
        })),
      );

      const departmentMap = new Map<string, { id: string; name: string; meta?: string }>();
      campusResponse.campuses.forEach((campus) => {
        campus.teachingSchools.forEach((school) => {
          (school.departments ?? []).forEach((department) => {
            departmentMap.set(department.id, {
              id: department.id,
              name: department.name,
              meta: `${campus.name} · ${school.name}`,
            });
          });
        });
        campus.nonTeachingDepartments.forEach((department) => {
          departmentMap.set(department.id, {
            id: department.id,
            name: department.name,
            meta: `${campus.name} · Non-Teaching`,
          });
        });
      });

      const employeeRecipients = employeeResponse.map((employee) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        position: employee.position ?? 'Unassigned',
        avatarUrl: employee.profileImage ?? undefined,
        meta: employee.school?.name ?? employee.schoolBranch ?? 'Unknown Campus',
      }));

      setRecipientPool({
        Campus: campusRecipients,
        School: schoolRecipients,
        Department: Array.from(departmentMap.values()),
        Employees: employeeRecipients,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load memo recipients.';
      toast.error(message);
    }
  }, []);

  React.useEffect(() => {
    void loadMemos();
    void loadRecipients();
  }, [loadMemos, loadRecipients]);

  const filteredMemos = useMemo(() => {
    return filterMemos(memos, filters).sort(
      (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );
  }, [memos, filters]);

  const createMemo = async (memo: MemoItem): Promise<boolean> => {
    if (isCreating) {
      return false;
    }

    setIsCreating(true);

    try {
      const recipients = memo.to;
      const primaryType = (recipients[0]?.type ?? 'All') as RecipientType;
      const recipientIds = primaryType === 'All' ? [] : recipients.map((recipient) => recipient.id);

      const response = await createAdminMemo({
        memoType: memo.memoType,
        agenda: memo.agenda,
        content: memo.content,
        attachments: memo.attachments,
        dateCreated: memo.dateCreated,
        effectiveDate: memo.effectiveDate,
        recipientType: primaryType,
        recipientIds,
      });

      setMemos((current) => [...response.memos.map(normalizeStatus), ...current]);
      toast.success('Memo created successfully.');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to create memo.';
      toast.error(message);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MemoFilters value={filters} onChange={setFilters} />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadMemos()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Memo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-lg col-span-3 border p-6 text-sm text-center text-muted-foreground">Loading memos...</div>
        ) : error ? (
          <div className="rounded-lg col-span-3 border p-6 text-sm text-center text-destructive">
            <p>{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => void loadMemos()}>
              Retry
            </Button>
          </div>
        ) : filteredMemos.length === 0 ? (
          <div className="rounded-lg col-span-3 border p-6 text-sm text-center text-muted-foreground">No memos match the selected filters.</div>
        ) : filteredMemos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onClick={() => setSelectedMemo(memo)} />
        ))}
      </div>

      <MemoDetailDialog open={Boolean(selectedMemo)} memo={selectedMemo} onClose={() => setSelectedMemo(null)} />

      <MemoCreateDialog
        open={isCreateOpen}
        recipientPool={recipientPool}
        recipientTypeOptions={recipientTypeOptions}
        memoTypeOptions={memoTypeOptions}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createMemo}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default AdminMemo;
