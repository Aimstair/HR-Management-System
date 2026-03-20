import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import type { FacultyEvaluationRecord } from '../types';
import { overallAverage, sectionAverage } from '../utils';

interface FacultyEvaluationDetailPanelProps {
  record: FacultyEvaluationRecord | null;
  onBack?: () => void;
}

const FacultyEvaluationDetailPanel: React.FC<FacultyEvaluationDetailPanelProps> = ({ record, onBack }) => {
  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a subject row to inspect section averages and open-ended answers.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-[calc(100vh-120px)]'>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className='text-2xl'>
            Evaluation Detail: {record.subjectCode} ({record.schoolYear} | {record.semester})
          </CardTitle>
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Back to List
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Overall Average</p>
          <p className="text-xl font-semibold">{overallAverage(record).toFixed(2)} / 4.00</p>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {record.sections.map((section) => (
            <div key={section.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{section.title}</p>
                <p className="text-sm font-semibold">{sectionAverage(section).toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                {section.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-start justify-between gap-2 border-t py-1 text-xs">
                    <p className="text-muted-foreground">{criterion.label}</p>
                    <span className="font-medium">{criterion.score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Teacher's Strong Points</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {record.strongPoints.length === 0 ? <li>No responses available.</li> : null}
              {record.strongPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Teacher's Areas Needing Improvement</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {record.improvements.length === 0 ? <li>No responses available.</li> : null}
              {record.improvements.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyEvaluationDetailPanel;
