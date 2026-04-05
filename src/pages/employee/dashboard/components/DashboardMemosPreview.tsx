import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { MemoItem } from '../../../admin/memo/types';
import { formatDateTime } from '../../../admin/memo/utils';

interface DashboardMemosPreviewProps {
  memos: MemoItem[];
}

const DashboardMemosPreview: React.FC<DashboardMemosPreviewProps> = ({ memos }) => {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Latest Memos</CardTitle>
        <CardDescription>Recent memo releases for quick awareness.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {memos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No memos available.</p>
        ) : (
          memos.map((memo) => (
            <div key={memo.id} className="rounded-sm border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{memo.agenda}</p>
                <Badge variant={memo.status === 'Upcoming' ? 'default' : 'secondary'}>{memo.status}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{memo.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Effective: {formatDateTime(memo.effectiveDate)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMemosPreview;
