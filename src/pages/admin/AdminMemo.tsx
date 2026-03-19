import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import MemoCard from './memo/components/MemoCard';
import MemoCreateDialog from './memo/components/MemoCreateDialog';
import MemoDetailDialog from './memo/components/MemoDetailDialog';
import MemoFilters from './memo/components/MemoFilters';
import { initialMemos, memoTypeOptions } from './memo/mockData';
import type { MemoFilterState, MemoItem } from './memo/types';
import { filterMemos } from './memo/utils';

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
  const [memos, setMemos] = useState<MemoItem[]>(initialMemos);
  const [filters, setFilters] = useState<MemoFilterState>(defaultFilterState);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);

  const filteredMemos = useMemo(() => {
    return filterMemos(memos, filters).sort(
      (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );
  }, [memos, filters]);

  const createMemo = (memo: MemoItem): void => {
    setMemos((current) => [memo, ...current]);
    toast.success('Memo created successfully.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MemoFilters value={filters} onChange={setFilters} />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Memo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMemos.length === 0 ? (
          <div className="rounded-lg col-span-3 border p-6 text-sm text-center text-muted-foreground">No memos match the selected filters.</div>
        ) : filteredMemos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onClick={() => setSelectedMemo(memo)} />
        ))}
      </div>

      <MemoDetailDialog open={Boolean(selectedMemo)} memo={selectedMemo} onClose={() => setSelectedMemo(null)} />

      <MemoCreateDialog
        open={isCreateOpen}
        memoTypeOptions={memoTypeOptions}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createMemo}
      />
    </div>
  );
};

export default AdminMemo;
