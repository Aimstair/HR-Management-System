import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Badge } from '../../../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import type { MemoItem } from '../types';
import { formatDateTime, summarizeRecipients } from '../utils';

interface MemoDetailDialogProps {
  open: boolean;
  memo: MemoItem | null;
  onClose: () => void;
}

const initials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
};

const MemoDetailDialog: React.FC<MemoDetailDialogProps> = ({ open, memo, onClose }) => {
  if (!memo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{memo.agenda}</DialogTitle>
          <DialogDescription>Memo Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{memo.memoType}</Badge>
            <Badge variant={memo.status === 'Upcoming' ? 'default' : 'secondary'}>{memo.status}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <p><span className="font-medium">Date Created:</span> {formatDateTime(memo.dateCreated)}</p>
            <p><span className="font-medium">Effective Date:</span> {formatDateTime(memo.effectiveDate)}</p>
          </div>

          <p><span className="font-medium">To:</span> {summarizeRecipients(memo.to)}</p>
          <p><span className="font-medium">Agenda:</span> {memo.agenda}</p>
          <div>
            <p className="font-medium">Content:</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{memo.content}</p>
          </div>

          <div>
            <p className="font-medium">Attachments:</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {memo.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No attachments.</p>
              ) : memo.attachments.map((attachment, index) => (
                <img key={`${memo.id}-att-${index}`} src={attachment} alt={`Attachment ${index + 1}`} className="h-28 w-full rounded-md border object-cover" />
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium">Acknowledged By</p>
            <div className="mt-2 space-y-2">
              {memo.acknowledgements.length === 0 ? (
                <p className="text-xs text-muted-foreground">No acknowledgements yet.</p>
              ) : memo.acknowledgements.map((acknowledgement) => (
                <div key={acknowledgement.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={acknowledgement.avatarUrl} alt={acknowledgement.name} />
                      <AvatarFallback>{initials(acknowledgement.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-tight">{acknowledgement.name}</p>
                      <p className="text-xs text-muted-foreground">{acknowledgement.position}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(acknowledgement.acknowledgedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoDetailDialog;
