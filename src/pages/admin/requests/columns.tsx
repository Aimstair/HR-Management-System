import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import type { ColumnDefinition, RequestCategory, RequestRecord } from './types';
import { formatDateTime, formatMoney } from './utils';

const initials = (name: string): string => {
  const [first, second] = name.split(' ');
  return `${first?.[0] || ''}${second?.[0] || ''}`.toUpperCase();
};

const employeeCell = (request: RequestRecord): React.ReactNode => (
  <div className="flex items-center gap-2 overflow-hidden">
    <Avatar className="h-7 w-7 shrink-0">
      <AvatarImage src={request.employee.avatarUrl} alt={request.employee.name} />
      <AvatarFallback>{initials(request.employee.name)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-xs font-medium leading-tight">{request.employee.name}</p>
      <p className="truncate text-[10px] leading-tight text-muted-foreground">{request.employee.position}</p>
    </div>
  </div>
);

const scheduleCell = (from?: string, to?: string): React.ReactNode => (
  <div className="space-y-0.5 text-[10px] leading-tight">
    <p className="truncate">From: {formatDateTime(from)}</p>
    <p className="truncate">To: {formatDateTime(to)}</p>
  </div>
);

const baseColumns = (): ColumnDefinition[] => [
  {
    id: 'employee',
    label: 'Employee',
    sortable: true,
    className: 'min-w-[230px] max-w-[230px]',
    render: employeeCell,
    sortValue: (request) => request.employee.name,
  },
  {
    id: 'requestDate',
    label: 'Request Date',
    sortable: true,
    className: 'min-w-[170px] max-w-[170px] text-[10px] leading-tight',
    render: (request) => formatDateTime(request.requestDate),
    sortValue: (request) => new Date(request.requestDate).getTime(),
  },
  {
    id: 'notes',
    label: 'Notes',
    sortable: true,
    className: 'min-w-[280px] max-w-[280px]',
    render: (request) => (
      <p className="truncate text-[10px] leading-tight text-muted-foreground">{request.notes}</p>
    ),
    sortValue: (request) => request.notes,
  },
];

export const getColumnsByCategory = (category: RequestCategory): ColumnDefinition[] => {
  if (category === 'leave') {
    return [
      ...baseColumns(),
      {
        id: 'duration',
        label: 'Duration',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{request.duration || 'N/A'}</span>,
        sortValue: (request) => request.duration || '',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        sortable: true,
        className: 'min-w-[230px] max-w-[230px]',
        render: (request) => scheduleCell(request.scheduleFrom, request.scheduleTo),
        sortValue: (request) => request.scheduleFrom || '',
      },
      {
        id: 'reliever',
        label: 'Reliever',
        sortable: true,
        className: 'max-w-[170px] text-[10px] leading-tight',
        render: (request) => <span className="truncate">{request.reliever || 'N/A'}</span>,
        sortValue: (request) => request.reliever || '',
      },
    ];
  }

  if (category === 'expense' || category === 'funds') {
    return [
      ...baseColumns(),
      {
        id: 'amount',
        label: 'Amount',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{formatMoney(request.amount)}</span>,
        sortValue: (request) => request.amount || 0,
      },
      {
        id: 'expenseDate',
        label: 'Expense Date',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{formatDateTime(request.expenseDate)}</span>,
        sortValue: (request) => (request.expenseDate ? new Date(request.expenseDate).getTime() : 0),
      },
    ];
  }

  if (category === 'wfh') {
    return [
      ...baseColumns(),
      {
        id: 'duration',
        label: 'Duration',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{request.duration || 'N/A'}</span>,
        sortValue: (request) => request.duration || '',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        sortable: true,
        className: 'min-w-[230px] max-w-[230px]',
        render: (request) => scheduleCell(request.scheduleFrom, request.scheduleTo),
        sortValue: (request) => request.scheduleFrom || '',
      },
    ];
  }

  if (category === 'undertime') {
    return [
      ...baseColumns(),
      {
        id: 'duration',
        label: 'Duration',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{request.duration || 'N/A'}</span>,
        sortValue: (request) => request.duration || '',
      },
      {
        id: 'startDate',
        label: 'Start Date',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{formatDateTime(request.startDate)}</span>,
        sortValue: (request) => (request.startDate ? new Date(request.startDate).getTime() : 0),
      },
    ];
  }

  if (category === 'overtime') {
    return [
      ...baseColumns(),
      {
        id: 'duration',
        label: 'Duration',
        sortable: true,
        className: 'text-[10px] leading-tight',
        render: (request) => <span className="truncate">{request.duration || 'N/A'}</span>,
        sortValue: (request) => request.duration || '',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        sortable: true,
        className: 'min-w-[230px] max-w-[230px]',
        render: (request) => scheduleCell(request.scheduleFrom, request.scheduleTo),
        sortValue: (request) => request.scheduleFrom || '',
      },
    ];
  }

  if (category === 'adjustments') {
    return [
      ...baseColumns(),
      {
        id: 'schedule',
        label: 'Schedule',
        sortable: true,
        className: 'min-w-[260px] max-w-[260px]',
        render: (request) => (
          <div className="space-y-0.5 text-[10px] leading-tight">
            <p className="truncate">New: {formatDateTime(request.scheduleFrom)} to {formatDateTime(request.scheduleTo)}</p>
            <p className="truncate text-muted-foreground">Previous: {formatDateTime(request.previousFrom)} to {formatDateTime(request.previousTo)}</p>
          </div>
        ),
        sortValue: (request) => request.scheduleFrom || '',
      },
    ];
  }

  if (category === 'shift') {
    return [
      ...baseColumns(),
      {
        id: 'shiftSelected',
        label: 'Shift Selected',
        sortable: true,
        className: 'min-w-[260px] max-w-[260px]',
        render: (request) => (
          <div className="space-y-0.5 text-[10px] leading-tight">
            <p className="truncate font-medium">{request.shiftName || 'N/A'}</p>
            <p className="truncate">{request.shiftTime || 'N/A'}</p>
            <p className="truncate text-muted-foreground">{request.shiftDays || 'N/A'}</p>
          </div>
        ),
        sortValue: (request) => request.shiftName || '',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        sortable: true,
        className: 'min-w-[230px] max-w-[230px]',
        render: (request) => scheduleCell(request.scheduleFrom, request.scheduleTo),
        sortValue: (request) => request.scheduleFrom || '',
      },
    ];
  }

  return [
    ...baseColumns(),
    {
      id: 'unrendered',
      label: 'Unrendered Datetime',
      sortable: true,
      className: 'min-w-[250px] max-w-[250px]',
      render: (request) => scheduleCell(request.unrenderedFrom, request.unrenderedTo),
      sortValue: (request) => request.unrenderedFrom || '',
    },
    {
      id: 'rendered',
      label: 'Rendered Work for Swap Datetime',
      sortable: true,
      className: 'min-w-[280px] max-w-[280px]',
      render: (request) => scheduleCell(request.renderedFrom, request.renderedTo),
      sortValue: (request) => request.renderedFrom || '',
    },
  ];
};
