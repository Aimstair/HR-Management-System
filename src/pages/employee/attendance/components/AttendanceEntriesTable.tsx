import React from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import { Button } from '../../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table';
import type { EmployeeAttendanceEntry } from '../../shared/employeePortalTypes';
import { EmployeeType } from '../../../../types';
import { Badge } from '../../../../../components/ui/badge';
import { formatDateLabel, formatTimeLabel } from '../../shared/employeePortalUtils';
import { cn } from '../../../../../lib/utils';

interface AttendanceEntriesTableProps {
  employeeType: EmployeeType;
  entries: EmployeeAttendanceEntry[];
  onDailyEditRequest: (entry: EmployeeAttendanceEntry) => void;
  onTeachingAppeal: (entry: EmployeeAttendanceEntry) => void;
}

type TeachingLegendStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'HOLIDAY';

interface TeachingTimetableCell {
  entry: EmployeeAttendanceEntry;
  status: TeachingLegendStatus;
  rowSpan: number;
  isUpcoming: boolean;
}

interface TeachingScheduleTemplate {
  subjectCode: string | null;
  subjectName: string | null;
  room: string | null;
  startMinutes: number;
  endMinutes: number;
  dayOfWeek: number;
}

const TEACHING_TIMETABLE_START_MINUTES = 7 * 60 + 30;
const TEACHING_TIMETABLE_END_MINUTES = 21 * 60;
const TEACHING_TIMETABLE_SLOT_MINUTES = 30;
const TEACHING_WEEK_DAYS = 7;
const TEACHING_DAY_COLUMN_WIDTH = 200;
const TEACHING_SLOT_ROW_HEIGHT_PX = 64;

const teachingStatusBadgeClass: Record<TeachingLegendStatus, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  LATE: 'bg-amber-100 text-amber-900 border-amber-300',
  ABSENT: 'bg-red-100 text-red-900 border-red-300',
  HOLIDAY: 'bg-slate-200 text-slate-700 border-slate-300',
};

const teachingCardClass: Record<TeachingLegendStatus, string> = {
  PRESENT: 'border-emerald-300 bg-emerald-100/80 text-emerald-950',
  LATE: 'border-amber-300 bg-amber-100/80 text-amber-950',
  ABSENT: 'border-red-300 bg-red-100/80 text-red-950',
  HOLIDAY: 'border-slate-300 bg-slate-200/80 text-slate-800',
};

const teachingLegendItems: Array<{ status: TeachingLegendStatus; label: string }> = [
  { status: 'PRESENT', label: 'Present' },
  { status: 'LATE', label: 'Late' },
  { status: 'ABSENT', label: 'Absent' },
  { status: 'HOLIDAY', label: 'Holiday' },
];

const toTeachingLegendStatus = (status: EmployeeAttendanceEntry['status']): TeachingLegendStatus => {
  if (status === 'EXCUSED') {
    return 'HOLIDAY';
  }

  if (status === 'LATE' || status === 'ABSENT' || status === 'PRESENT') {
    return status;
  }

  return 'PRESENT';
};

const getMinutesFromIso = (isoDateTime: string | null | undefined): number | null => {
  if (!isoDateTime) {
    return null;
  }

  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours() * 60 + date.getMinutes();
};

const formatTimeSlotLabel = (minutes: number): string => {
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60, 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (date: Date): Date => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return addDays(normalized, -normalized.getDay());
};

const toIsoDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatWeekRangeLabel = (startDate: Date, endDate: Date): string => {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(startDate);

  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: sameYear ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(endDate);

  if (sameYear) {
    return `${startLabel} - ${endLabel}, ${startDate.getFullYear()}`;
  }

  return `${startLabel}, ${startDate.getFullYear()} - ${endLabel}`;
};

const toIsoDateTimeFromKey = (dateKey: string, minutes: number): string => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${dateKey}T${hours}:${mins}:00`;
};

interface TeachingAttendanceTimetableProps {
  entries: EmployeeAttendanceEntry[];
  onTeachingAppeal: (entry: EmployeeAttendanceEntry) => void;
}

const TeachingAttendanceTimetable: React.FC<TeachingAttendanceTimetableProps> = ({
  entries,
  onTeachingAppeal,
}) => {
  const baseWeekStart = React.useMemo(() => {
    return startOfWeek(new Date());
  }, []);

  const [weekOffset, setWeekOffset] = React.useState<number>(0);

  React.useEffect(() => {
    setWeekOffset(0);
  }, [baseWeekStart]);

  const weekStart = React.useMemo(
    () => addDays(baseWeekStart, weekOffset * TEACHING_WEEK_DAYS),
    [baseWeekStart, weekOffset],
  );

  const weekDates = React.useMemo(() => {
    return Array.from({ length: TEACHING_WEEK_DAYS }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const weekDateKeys = React.useMemo(() => {
    return weekDates.map((date) => toIsoDateKey(date));
  }, [weekDates]);

  const weekRangeLabel = React.useMemo(() => {
    return formatWeekRangeLabel(weekDates[0], weekDates[TEACHING_WEEK_DAYS - 1]);
  }, [weekDates]);

  const timeSlots = React.useMemo(() => {
    const slots: number[] = [];

    for (
      let minutes = TEACHING_TIMETABLE_START_MINUTES;
      minutes <= TEACHING_TIMETABLE_END_MINUTES;
      minutes += TEACHING_TIMETABLE_SLOT_MINUTES
    ) {
      slots.push(minutes);
    }

    return slots;
  }, []);

  const timetableCells = React.useMemo(() => {
    const cellsByDate: Record<string, Record<number, TeachingTimetableCell>> = {};
    const coveredRowsByDate: Record<string, Set<number>> = {};
    const todayDateKey = toIsoDateKey(new Date());

    weekDateKeys.forEach((dateKey) => {
      cellsByDate[dateKey] = {};
      coveredRowsByDate[dateKey] = new Set<number>();
    });

    const templates: TeachingScheduleTemplate[] = [];
    const templateKeySet = new Set<string>();

    entries.forEach((entry) => {
      const startMinutes = getMinutesFromIso(entry.sessionStart);
      const endMinutes = getMinutesFromIso(entry.sessionEnd);
      if (startMinutes === null || endMinutes === null) {
        return;
      }

      const entryDate = new Date(`${entry.date}T00:00:00`);
      const dayOfWeek = entryDate.getDay();

      const templateKey = [
        dayOfWeek,
        startMinutes,
        endMinutes,
        entry.subjectCode ?? '',
        entry.subjectName ?? '',
        entry.room ?? '',
      ].join('|');

      if (templateKeySet.has(templateKey)) {
        return;
      }

      templateKeySet.add(templateKey);
      templates.push({
        subjectCode: entry.subjectCode ?? null,
        subjectName: entry.subjectName ?? null,
        room: entry.room ?? null,
        startMinutes,
        endMinutes,
        dayOfWeek,
      });
    });

    const actualEntriesByDate = new Map<string, EmployeeAttendanceEntry[]>();
    entries.forEach((entry) => {
      if (!weekDateKeys.includes(entry.date)) {
        return;
      }

      const list = actualEntriesByDate.get(entry.date) ?? [];
      list.push(entry);
      actualEntriesByDate.set(entry.date, list);
    });

    const entriesForWeek: Array<{ entry: EmployeeAttendanceEntry; isUpcoming: boolean }> = [];

    weekDateKeys.forEach((dateKey) => {
      const actualEntries = actualEntriesByDate.get(dateKey) ?? [];
      actualEntries.forEach((entry) => {
        entriesForWeek.push({ entry, isUpcoming: false });
      });

      if (dateKey < todayDateKey) {
        return;
      }

      const occupiedSlotKeys = new Set<string>();
      actualEntries.forEach((entry) => {
        const start = getMinutesFromIso(entry.sessionStart);
        const end = getMinutesFromIso(entry.sessionEnd);
        if (start === null || end === null) {
          return;
        }

        occupiedSlotKeys.add(
          [start, end, entry.subjectCode ?? '', entry.subjectName ?? '', entry.room ?? ''].join('|'),
        );
      });

      const date = new Date(`${dateKey}T00:00:00`);
      const dayOfWeek = date.getDay();

      templates
        .filter((template) => template.dayOfWeek === dayOfWeek)
        .forEach((template, index) => {
          const slotKey = [
            template.startMinutes,
            template.endMinutes,
            template.subjectCode ?? '',
            template.subjectName ?? '',
            template.room ?? '',
          ].join('|');

          if (occupiedSlotKeys.has(slotKey)) {
            return;
          }

          entriesForWeek.push({
            entry: {
              id: `UPCOMING-${dateKey}-${index}-${template.startMinutes}`,
              date: dateKey,
              mode: 'TEACHING_SESSION',
              campus: null,
              shift: null,
              timeIn: null,
              timeOut: null,
              status: undefined,
              subjectCode: template.subjectCode,
              subjectName: template.subjectName,
              room: template.room,
              sessionStart: toIsoDateTimeFromKey(dateKey, template.startMinutes),
              sessionEnd: toIsoDateTimeFromKey(dateKey, template.endMinutes),
            },
            isUpcoming: true,
          });
        });
    });

    const sortedEntries = [...entriesForWeek].sort((a, b) => {
      const aEntry = a.entry;
      const bEntry = b.entry;
      const dateDiff = new Date(aEntry.date).getTime() - new Date(bEntry.date).getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }

      const aStart = getMinutesFromIso(aEntry.sessionStart) ?? TEACHING_TIMETABLE_START_MINUTES;
      const bStart = getMinutesFromIso(bEntry.sessionStart) ?? TEACHING_TIMETABLE_START_MINUTES;
      return aStart - bStart;
    });

    sortedEntries.forEach((item) => {
      const entry = item.entry;
      if (!cellsByDate[entry.date]) {
        return;
      }

      const startMinutes = getMinutesFromIso(entry.sessionStart);
      if (startMinutes === null) {
        return;
      }

      const endMinutes = getMinutesFromIso(entry.sessionEnd);
      const boundedStartMinutes = Math.max(
        TEACHING_TIMETABLE_START_MINUTES,
        Math.min(TEACHING_TIMETABLE_END_MINUTES - TEACHING_TIMETABLE_SLOT_MINUTES, startMinutes),
      );

      const boundedEndMinutes = Math.max(
        boundedStartMinutes + TEACHING_TIMETABLE_SLOT_MINUTES,
        Math.min(TEACHING_TIMETABLE_END_MINUTES, endMinutes ?? boundedStartMinutes + TEACHING_TIMETABLE_SLOT_MINUTES),
      );

      const startRow = Math.floor(
        (boundedStartMinutes - TEACHING_TIMETABLE_START_MINUTES) / TEACHING_TIMETABLE_SLOT_MINUTES,
      );

      if (startRow < 0 || startRow >= timeSlots.length) {
        return;
      }

      if (coveredRowsByDate[entry.date].has(startRow)) {
        return;
      }

      const boundedEndExclusiveMinutes = Math.min(
        TEACHING_TIMETABLE_END_MINUTES + TEACHING_TIMETABLE_SLOT_MINUTES,
        boundedEndMinutes,
      );

      const endRowExclusive = Math.max(
        startRow + 1,
        Math.ceil(
          (boundedEndExclusiveMinutes - TEACHING_TIMETABLE_START_MINUTES) /
            TEACHING_TIMETABLE_SLOT_MINUTES,
        ),
      );

      let rowSpan = Math.max(1, endRowExclusive - startRow);

      rowSpan = Math.min(rowSpan, timeSlots.length - startRow);

      cellsByDate[entry.date][startRow] = {
        entry,
        status: toTeachingLegendStatus(entry.status),
        rowSpan,
        isUpcoming: item.isUpcoming,
      };

      for (let index = startRow + 1; index < startRow + rowSpan; index += 1) {
        coveredRowsByDate[entry.date].add(index);
      }
    });

    return {
      cellsByDate,
      coveredRowsByDate,
    };
  }, [entries, timeSlots, weekDateKeys]);

  const minimumTableWidth = Math.max(
    920,
    140 + TEACHING_WEEK_DAYS * TEACHING_DAY_COLUMN_WIDTH,
  );

  return (
    <div className="space-y-3 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((current) => current - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <p className="min-w-45 text-sm font-medium">{weekRangeLabel}</p>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((current) => current + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        

        <div className="flex flex-wrap gap-2">
          {teachingLegendItems.map((item) => (
            <Badge key={item.status} variant="outline" className={teachingStatusBadgeClass[item.status]}>
              {item.label}
            </Badge>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setWeekOffset(0)}
          disabled={weekOffset === 0}
        >
          Today
        </Button>
      </div>

      <div className="rounded-sm border">
        <ScrollArea className="h-[calc(100vh-21.5rem)] w-full">
          <div style={{ minWidth: `${minimumTableWidth}px` }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-30">Time</TableHead>
                    {weekDates.map((date) => {
                    const dateKey = toIsoDateKey(date);
                    const dayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
                      date,
                    );

                    return (
                      <TableHead
                        key={dateKey}
                        className="border-x text-center align-middle"
                        style={{
                          width: `${TEACHING_DAY_COLUMN_WIDTH}px`,
                          minWidth: `${TEACHING_DAY_COLUMN_WIDTH}px`,
                          maxWidth: `${TEACHING_DAY_COLUMN_WIDTH}px`,
                        }}
                      >
                        <div className="space-y-0.5 py-1">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{dayLabel}</p>
                          <p>{formatDateLabel(dateKey)}</p>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TEACHING_WEEK_DAYS + 1} className="py-8 text-center text-muted-foreground">
                      No teaching attendance sessions found for the selected month.
                    </TableCell>
                  </TableRow>
                ) : (
                  timeSlots.map((minutes, rowIndex) => (
                    <TableRow key={minutes} className="h-16">
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {formatTimeSlotLabel(minutes)}
                      </TableCell>

                      {weekDateKeys.map((dateKey) => {
                        if (timetableCells.coveredRowsByDate[dateKey].has(rowIndex)) {
                          return null;
                        }

                        const cell = timetableCells.cellsByDate[dateKey][rowIndex];
                        if (!cell) {
                          return <TableCell key={`${dateKey}-${rowIndex}`} className="border-x align-top" />;
                        }

                        const canAppeal =
                          !cell.isUpcoming && (cell.status === 'LATE' || cell.status === 'ABSENT');

                        return (
                          <TableCell
                            key={`${dateKey}-${rowIndex}`}
                            rowSpan={cell.rowSpan}
                            className="border-x align-top p-2"
                          >
                            <div
                              className={cn(
                                'space-y-1.5 rounded-sm border p-2 text-xs shadow-md',
                                cell.isUpcoming
                                  ? 'border-dashed border-sky-300 bg-sky-100/70 text-sky-900'
                                  : teachingCardClass[cell.status],
                              )}
                              style={{ minHeight: `${cell.rowSpan * TEACHING_SLOT_ROW_HEIGHT_PX - 8}px` }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold leading-tight">{cell.entry.subjectCode ?? 'N/A'}</p>
                                {cell.isUpcoming ? (
                                  <Badge
                                    variant="outline"
                                    className="h-5 px-1.5 text-[10px] uppercase border-sky-300 bg-sky-200 text-sky-900"
                                  >
                                    Upcoming
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={cn('h-5 px-1.5 text-[10px] uppercase', teachingStatusBadgeClass[cell.status])}
                                  >
                                    {cell.status}
                                  </Badge>
                                )}
                              </div>

                              <p className="truncate text-[11px]">{cell.entry.subjectName ?? 'Unassigned subject'}</p>

                              <p className="text-[11px]">
                                {cell.entry.sessionStart && cell.entry.sessionEnd
                                  ? `${formatTimeLabel(cell.entry.sessionStart)} - ${formatTimeLabel(cell.entry.sessionEnd)}`
                                  : '--'}
                              </p>

                              <p className="text-[11px]">{cell.entry.room ? `Room ${cell.entry.room}` : 'Room --'}</p>

                              {canAppeal ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-full"
                                  onClick={() => onTeachingAppeal(cell.entry)}
                                >
                                  Appeal
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const AttendanceEntriesTable: React.FC<AttendanceEntriesTableProps> = ({
  employeeType,
  entries,
  onDailyEditRequest,
  onTeachingAppeal,
}) => {
  if (employeeType === EmployeeType.TEACHING) {
    return <TeachingAttendanceTimetable entries={entries} onTeachingAppeal={onTeachingAppeal} />;
  }

  return (
    <div className="rounded-sm border">
      <ScrollArea className="h-107.5 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No attendance entries found for the selected month.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{formatDateLabel(entry.date)}</TableCell>
                  <TableCell>{formatTimeLabel(entry.timeIn)}</TableCell>
                  <TableCell>{formatTimeLabel(entry.timeOut)}</TableCell>
                  <TableCell>{entry.campus ?? '--'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onDailyEditRequest(entry)}
                      aria-label="Request attendance edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default AttendanceEntriesTable;
