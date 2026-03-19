import type { MemoFilterState, MemoItem, MemoRecipient, MemoStatus, RecipientType } from './types';

export const formatDateTime = (iso: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};

export const inferMemoStatus = (effectiveDate: string): MemoStatus => {
  return new Date(effectiveDate).getTime() > Date.now() ? 'Upcoming' : 'Sent';
};

const isWithin = (target: Date, start: Date, end: Date): boolean => target >= start && target <= end;

const getTimeWindow = (filterState: MemoFilterState): { start: Date; end: Date } | null => {
  const { timeFilter: filter, selectedMonth, selectedYear, rangeStart, rangeEnd } = filterState;
  const now = new Date();

  if (filter === 'range') {
    if (!rangeStart || !rangeEnd) {
      return null;
    }
    return { start: new Date(rangeStart), end: new Date(rangeEnd) };
  }

  if (filter === 'day') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (filter === 'week') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (filter === 'month') {
    const monthIndex = Number.parseInt(selectedMonth, 10);
    const year = Number.parseInt(selectedYear, 10);
    const safeMonthIndex = Number.isNaN(monthIndex) ? now.getMonth() : monthIndex;
    const safeYear = Number.isNaN(year) ? now.getFullYear() : year;
    const start = new Date(safeYear, safeMonthIndex, 1, 0, 0, 0, 0);
    const end = new Date(safeYear, safeMonthIndex + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  const year = Number.parseInt(selectedYear, 10);
  const safeYear = Number.isNaN(year) ? now.getFullYear() : year;
  const start = new Date(safeYear, 0, 1, 0, 0, 0, 0);
  const end = new Date(safeYear, 11, 31, 23, 59, 59, 999);
  return { start, end };
};

export const filterMemos = (memos: MemoItem[], filterState: MemoFilterState): MemoItem[] => {
  const query = filterState.search.trim().toLowerCase();
  const window = getTimeWindow(filterState);

  return memos.filter((memo) => {
    const matchesSearch =
      query.length === 0 ||
      memo.memoType.toLowerCase().includes(query) ||
      memo.agenda.toLowerCase().includes(query) ||
      memo.content.toLowerCase().includes(query) ||
      memo.to.some((recipient) => recipient.name.toLowerCase().includes(query));

    const matchesStatus = filterState.status === 'all' || memo.status === filterState.status;

    const matchesTime =
      !window || isWithin(new Date(memo.effectiveDate), window.start, window.end) || isWithin(new Date(memo.dateCreated), window.start, window.end);

    return matchesSearch && matchesStatus && matchesTime;
  });
};

export const summarizeRecipients = (recipients: MemoRecipient[]): string => {
  if (recipients.length === 0) {
    return 'No recipients';
  }
  if (recipients.length <= 2) {
    return recipients.map((recipient) => recipient.name).join(', ');
  }
  return `${recipients[0].name}, ${recipients[1].name} and ${recipients.length - 2} more`;
};

export const makeRecipient = (
  type: RecipientType,
  item: { id: string; name: string; position?: string; avatarUrl?: string },
): MemoRecipient => ({
  id: item.id,
  name: item.name,
  type,
  position: item.position,
  avatarUrl: item.avatarUrl,
});
