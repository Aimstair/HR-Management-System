import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import type { MemoItem } from '../types';
import { formatDateTime, memoRequiresAcknowledgement, summarizeRecipients } from '../utils';

interface MemoDetailDialogProps {
  open: boolean;
  memo: MemoItem | null;
  onClose: () => void;
  onAcknowledge?: (memoId: string) => void;
  currentUserId?: string;
}

const initials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
};

const isImageAttachment = (url: string): boolean => {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
};

const attachmentLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    const name = parsed.pathname.split('/').pop();
    return name ? decodeURIComponent(name) : url;
  } catch {
    const name = url.split('/').pop();
    return name ? decodeURIComponent(name) : url;
  }
};

const MemoDetailDialog: React.FC<MemoDetailDialogProps> = ({ open, memo, onClose, onAcknowledge, currentUserId }) => {
  if (!memo) {
    return null;
  }

  const requiresAcknowledgement = memoRequiresAcknowledgement(memo);
  const hasAcknowledged = currentUserId ? memo.acknowledgements?.some((a) => a.employeeId === currentUserId) : false;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{memo.agenda}</DialogTitle>
          <DialogDescription>Memo Details</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh] pr-4">
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{memo.memoType}</Badge>
                <Badge variant={memo.status === 'Upcoming' ? 'default' : 'secondary'}>{memo.status}</Badge>
                <Badge
                  variant="outline"
                  className={requiresAcknowledgement ? 'border-amber-300 bg-amber-100 text-amber-900' : undefined}
                >
                  {requiresAcknowledgement ? 'Acknowledgement Required' : 'For Information Only'}
                </Badge>
              </div>
              {onAcknowledge && currentUserId && requiresAcknowledgement && (
                hasAcknowledged ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Acknowledged
                  </span>
                ) : (
                  <Button size="sm" onClick={() => onAcknowledge(memo.id)}>
                    Acknowledge
                  </Button>
                )
              )}
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
                  isImageAttachment(attachment) ? (
                    <a
                      key={`${memo.id}-att-${index}`}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="h-28 w-full rounded-md border object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      key={`${memo.id}-att-${index}`}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md border p-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{attachmentLabel(attachment)}</span>
                    </a>
                  )
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Acknowledged By</p>
                {requiresAcknowledgement && memo.acknowledgements.length > 0 ? (
                  <span className="text-xs text-muted-foreground">{memo.acknowledgements.length} acknowledged</span>
                ) : null}
              </div>
              {/* Fixed-height, scrollable list so long acknowledgement lists don't stretch the modal. */}
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-md pr-1">
                {!requiresAcknowledgement ? (
                  <p className="text-xs text-muted-foreground">
                    This is an informational memo ({memo.memoType}); no acknowledgement is needed.
                  </p>
                ) : memo.acknowledgements.length === 0 ? (
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MemoDetailDialog;
