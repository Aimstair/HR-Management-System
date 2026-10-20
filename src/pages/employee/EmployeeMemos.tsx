import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MemoCard from '../admin/memo/components/MemoCard';
import MemoDetailDialog from '../admin/memo/components/MemoDetailDialog';
import type { MemoFilterState } from '../admin/memo/types';
import { filterMemos } from '../admin/memo/utils';
import EmployeeMemoFilters from './memos/components/EmployeeMemoFilters';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import { getCurrentMonthKey } from './shared/employeePortalUtils';
import { useAuth } from '../../context/AuthContext';

const MEMO_QUERY_PARAM = 'memo';

const monthValueToFilterParts = (monthValue: string): { monthIndex: string; year: string } => {
  const [year = '', month = '01'] = monthValue.split('-');
  return {
    year,
    monthIndex: String(Math.max(0, Number(month) - 1)),
  };
};

const toMonthKey = (isoDate: string): string | null => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const EmployeeMemos: React.FC = () => {
  const { user } = useAuth();
  const { memos, acknowledgeMemo } = useEmployeePortal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonthKey());

  // The open memo lives in the URL (?memo=<id>) so dashboard links can deep-link to it,
  // and it is read from the live list so acknowledging updates the open dialog.
  const selectedMemoId = searchParams.get(MEMO_QUERY_PARAM);
  const selectedMemo = React.useMemo(
    () => (selectedMemoId ? memos.find((memo) => memo.id === selectedMemoId) ?? null : null),
    [memos, selectedMemoId],
  );

  const openMemo = React.useCallback(
    (memoId: string | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (memoId) {
            next.set(MEMO_QUERY_PARAM, memoId);
          } else {
            next.delete(MEMO_QUERY_PARAM);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Show the deep-linked memo's month so it is also visible in the grid behind the dialog.
  const syncedMemoIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!selectedMemo || syncedMemoIdRef.current === selectedMemo.id) {
      return;
    }

    syncedMemoIdRef.current = selectedMemo.id;
    const monthKey = toMonthKey(selectedMemo.effectiveDate);
    if (monthKey) {
      setSelectedMonth(monthKey);
    }
  }, [selectedMemo]);

  const filters = React.useMemo<MemoFilterState>(() => {
    const { monthIndex, year } = monthValueToFilterParts(selectedMonth);

    return {
      search,
      status: 'all',
      timeFilter: 'month',
      selectedMonth: monthIndex,
      selectedYear: year,
      rangeStart: '',
      rangeEnd: '',
    };
  }, [search, selectedMonth]);

  const filteredMemos = React.useMemo(() => {
    return filterMemos(memos, filters).sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
    );
  }, [filters, memos]);

  return (
    <div className="space-y-6">
      <EmployeeMemoFilters
        month={selectedMonth}
        search={search}
        onMonthChange={setSelectedMonth}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredMemos.length === 0 ? (
          <div className="col-span-full rounded-sm border p-10 text-center text-sm text-muted-foreground">
            No memos received for the selected filters.
          </div>
        ) : (
          filteredMemos.map((memo) => (
            <div key={memo.id} className="h-65 [&>div]:h-full">
              <MemoCard memo={memo} onClick={() => openMemo(memo.id)} />
            </div>
          ))
        )}
      </div>

      <MemoDetailDialog
        open={Boolean(selectedMemo)}
        memo={selectedMemo}
        onClose={() => openMemo(null)}
        currentUserId={user?.id}
        onAcknowledge={acknowledgeMemo}
      />
    </div>
  );
};

export default EmployeeMemos;
