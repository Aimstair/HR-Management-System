import React from 'react';
import MemoCard from '../admin/memo/components/MemoCard';
import MemoDetailDialog from '../admin/memo/components/MemoDetailDialog';
import type { MemoFilterState, MemoItem } from '../admin/memo/types';
import { filterMemos } from '../admin/memo/utils';
import EmployeeMemoFilters from './memos/components/EmployeeMemoFilters';
import { useEmployeePortal } from './shared/EmployeePortalProvider';
import { getCurrentMonthKey } from './shared/employeePortalUtils';

const monthValueToFilterParts = (monthValue: string): { monthIndex: string; year: string } => {
  const [year = '', month = '01'] = monthValue.split('-');
  return {
    year,
    monthIndex: String(Math.max(0, Number(month) - 1)),
  };
};

const EmployeeMemos: React.FC = () => {
  const { memos } = useEmployeePortal();
  const [search, setSearch] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonthKey());
  const [selectedMemo, setSelectedMemo] = React.useState<MemoItem | null>(null);

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
              <MemoCard memo={memo} onClick={() => setSelectedMemo(memo)} />
            </div>
          ))
        )}
      </div>

      <MemoDetailDialog
        open={Boolean(selectedMemo)}
        memo={selectedMemo}
        onClose={() => setSelectedMemo(null)}
      />
    </div>
  );
};

export default EmployeeMemos;
