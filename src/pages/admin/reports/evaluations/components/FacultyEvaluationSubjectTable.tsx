import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../components/ui/table';
import Paginator from '../../requests/components/Paginator';
import type { FacultyEvaluationRecord } from '../types';
import { overallAverage, paginate, sectionAverage } from '../utils';

interface FacultyEvaluationSubjectTableProps {
  rows: FacultyEvaluationRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
}

const PAGE_SIZE = 5;
const FIXED_ROWS = 5;

const FacultyEvaluationSubjectTable: React.FC<FacultyEvaluationSubjectTableProps> = ({
  rows,
  selectedRecordId,
  onSelectRecord,
}) => {
  const [page, setPage] = useState<number>(1);

  const { rows: pagedRows, totalPages, safePage } = useMemo(
    () => paginate(rows, page, PAGE_SIZE),
    [rows, page],
  );

  React.useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const renderedRows = pagedRows.length === 0 ? 1 : pagedRows.length;
  const blankCount = Math.max(0, FIXED_ROWS - renderedRows);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Respondents</TableHead>
              <TableHead>Section Averages</TableHead>
              <TableHead className="text-right">Overall</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow className="h-[99px]">
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No evaluation records for selected filter.
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((record) => {
                const isSelected = selectedRecordId === record.id;

                return (
                  <TableRow
                    key={record.id}
                    className={`h-[99px] cursor-pointer transition-colors ${isSelected ? 'bg-accent/70' : 'hover:bg-muted/50'}`}
                    onClick={() => onSelectRecord(record.id)}
                  >
                    <TableCell>
                      <div className="max-w-70">
                        <p className="font-medium text-sm">{record.subjectCode}</p>
                        <p className="truncate text-xs text-muted-foreground">{record.subjectTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.schoolYear} | {record.semester}</TableCell>
                    <TableCell>{record.respondentCount}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {record.sections.map((section) => (
                          <p key={section.id} className="truncate">
                            {section.title}: <span className="text-foreground">{sectionAverage(section).toFixed(2)}</span>
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{overallAverage(record).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })
            )}

            {Array.from({ length: blankCount }, (_, index) => (
              <TableRow key={`blank-row-${index}`} className="h-[99px]">
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Paginator currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default FacultyEvaluationSubjectTable;
