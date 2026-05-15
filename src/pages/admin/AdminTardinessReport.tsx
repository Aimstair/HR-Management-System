import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { dtrEntries, reportEmployees } from './reports/attendance/mockData';
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
  const [department, setDepartment] = useState<string>('all');
  const [activeStatuses, setActiveStatuses] = useState<Set<TardinessStatus>>(
    new Set(LEGEND_ITEMS.map((item) => item.key)),
  );

  const monthDays = useMemo(() => makeMonthDays(year, month), [year, month]);

  const nonTeachingDepartmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          reportEmployees
            .filter((employee) => employee.employeeType === 'NON_TEACHING')
            .map((employee) => employee.department),
        ),
      ).sort(),
    [],
  );

  React.useEffect(() => {
    if (department !== 'all' && !nonTeachingDepartmentOptions.includes(department)) {
      setDepartment('all');
    }
  }, [department, nonTeachingDepartmentOptions]);

  const rows = useMemo(() => {
    const filteredEmployees = reportEmployees.filter((employee) =>
      employee.fullName.toLowerCase().includes(search.trim().toLowerCase()) &&
      (department === 'all' || employee.department === department),
    );

    return buildTardinessRows(filteredEmployees, dtrEntries, monthDays);
  }, [department, monthDays, search]);

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
      <Card className='relative py-5'>
        <CardContent className='flex flex-col md:flex-row items-start'>
          <TardinessFilters
            search={search}
            month={month}
            year={year}
            department={department}
            departmentOptions={nonTeachingDepartmentOptions}
            onSearchChange={setSearch}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onDepartmentChange={setDepartment}
          />
          
          <div className='flex flex-col w-full gap-2 items-start justify-start'> 
            <div>
              <span className='text-[12px] p-0'>Click any legend badge to toggle its cell color visibility in the table.</span>
            </div>

            <TardinessLegend activeStatuses={activeStatuses} onToggle={toggleStatus} />
          </div>
        </CardContent>
      </Card>

      <Card className='p-0 relative'>
        <TardinessTable monthDays={monthDays} rows={rows} activeStatuses={activeStatuses} />
      </Card>
    </div>
  );
};

export default AdminTardinessReport;
