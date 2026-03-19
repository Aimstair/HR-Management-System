import React from 'react';
import { CalendarClock, Image as ImageIcon, Megaphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import type { MemoItem } from '../types';
import { formatDateTime, summarizeRecipients } from '../utils';

interface MemoCardProps {
  memo: MemoItem;
  onClick: () => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick }) => {
  return (
    <Card className="cursor-pointer border-primary/15 transition hover:border-primary/40 hover:bg-primary/5" onClick={onClick}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{memo.memoType}</Badge>
          <Badge variant={memo.status === 'Upcoming' ? 'default' : 'secondary'}>{memo.status}</Badge>
        </div>
        <CardTitle className="text-base leading-tight">{memo.agenda}</CardTitle>
        <CardDescription className="line-clamp-2">{memo.content}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5" /> To: {summarizeRecipients(memo.to)}</p>
        <p className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" /> Created: {formatDateTime(memo.dateCreated)}</p>
        <p className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" /> Effective: {formatDateTime(memo.effectiveDate)}</p>
        <p className="flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Attachments: {memo.attachments.length}</p>
      </CardContent>
    </Card>
  );
};

export default MemoCard;
