import React, { useMemo, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { dtrEntries, reportEmployees } from './reports/mockData';
import TardinessFilters from './reports/tardiness/components/TardinessFilters';
import TardinessLegend from './reports/tardiness/components/TardinessLegend';
import TardinessTable from './reports/tardiness/components/TardinessTable';
import { LEGEND_ITEMS } from './reports/tardiness/mockData';
import type { TardinessStatus } from './reports/tardiness/types';
import { buildTardinessRows, makeMonthDays } from './reports/tardiness/utils';

const AdminTardinessReport: React.FC = () => {
  const now = new Date();
  const [search, setSearch] = useState<string>('');
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [activeStatuses, setActiveStatuses] = useState<Set<TardinessStatus>>(
    new Set(LEGEND_ITEMS.map((item) => item.key)),
  );

  const monthDays = useMemo(() => makeMonthDays(year, month), [year, month]);

  const rows = useMemo(() => {
    const filteredEmployees = reportEmployees.filter((employee) =>
      employee.fullName.toLowerCase().includes(search.trim().toLowerCase()),
    );

    return buildTardinessRows(filteredEmployees, dtrEntries, monthDays);
  }, [monthDays, search]);

  const toggleStatus = (status: TardinessStatus): void => {
    setActiveStatuses((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-col md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Tardiness Report</h1>
          <p className="text-sm text-muted-foreground">
            Monthly tardiness matrix with day-by-day status, summary badges, and color legend toggles.
          </p>
        </div>

        <TardinessFilters
        search={search}
        month={month}
        year={year}
        onSearchChange={setSearch}
        onMonthChange={setMonth}
        onYearChange={setYear}
        />
      </div>

      <Card className='relative'>
        <CardHeader>
          <CardTitle>Legend Visibility</CardTitle>
          <CardDescription>Click any legend badge to toggle its cell color visibility in the table.</CardDescription>
        </CardHeader>
        
        <TardinessLegend activeStatuses={activeStatuses} onToggle={toggleStatus} />
      </Card>

      <Card className='p-0 relative'>
        <TardinessTable monthDays={monthDays} rows={rows} activeStatuses={activeStatuses} />
      </Card>
    </div>
  );
};

export default AdminTardinessReport;
