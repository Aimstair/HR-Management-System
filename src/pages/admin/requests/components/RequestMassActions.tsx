import React from 'react';
import { Check, X, Ban } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '../../../../../components/ui/popover';

interface RequestMassActionsProps {
  selectedCount: number;
  onApprove: () => void;
  onDecline: () => void;
  onCancel: () => void;
}

const RequestMassActions: React.FC<RequestMassActionsProps> = ({
  selectedCount,
  onApprove,
  onDecline,
  onCancel,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Popover open={selectedCount > 0}>
      <PopoverAnchor className="fixed bottom-4 left-1/2 h-0 w-0 -translate-x-1/2" />
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="z-[70] w-[min(94vw,760px)] rounded-xl border border-primary/20 bg-primary/60 p-3 shadow-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{selectedCount} request(s) selected</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="border-destructive/30" onClick={onDecline}>
              <X className="h-4 w-4" />
              Decline
            </Button>
            <Button size="sm" variant="outline" className="border-muted-foreground/30" onClick={onCancel}>
              <Ban className="h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={onApprove}>
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RequestMassActions;
