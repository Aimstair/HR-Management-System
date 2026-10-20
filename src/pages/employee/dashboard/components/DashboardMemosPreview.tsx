import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { MemoItem } from '../../../admin/memo/types';
import { formatDateTime, memoRequiresAcknowledgement } from '../../../admin/memo/utils';

interface DashboardMemosPreviewProps {
  memos: MemoItem[];
  currentUserId?: string;
}

const DashboardMemosPreview: React.FC<DashboardMemosPreviewProps> = ({ memos, currentUserId }) => {
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
          memos.map((memo) => {
            const requiresAcknowledgement = memoRequiresAcknowledgement(memo);
            const isAcknowledged = Boolean(
              currentUserId && memo.acknowledgements.some((ack) => ack.employeeId === currentUserId),
            );
            const badge = !requiresAcknowledgement
              ? { label: 'For Information', className: 'border-slate-300 bg-slate-100 text-slate-700' }
              : isAcknowledged
                ? { label: 'Acknowledged', className: 'border-emerald-300 bg-emerald-100 text-emerald-900' }
                : { label: 'Not Acknowledged', className: 'border-amber-300 bg-amber-100 text-amber-900' };

            return (
              <Link
                key={memo.id}
                to={`/portal/memos?memo=${encodeURIComponent(memo.id)}`}
                className="block rounded-sm border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{memo.agenda}</p>
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{memo.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Effective: {formatDateTime(memo.effectiveDate)}
                </p>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMemosPreview;
