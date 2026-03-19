import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';
import { recipientPool, recipientTypeOptions } from '../mockData';
import type { MemoItem, MemoRecipient, MemoType, RecipientType } from '../types';
import { inferMemoStatus } from '../utils';
import RecipientPicker from './RecipientPicker';
import { ScrollArea } from '../../../../../components/ui/scroll-area';

interface MemoCreateDialogProps {
  open: boolean;
  memoTypeOptions: readonly MemoType[];
  onClose: () => void;
  onCreate: (memo: MemoItem) => void;
}

const MemoCreateDialog: React.FC<MemoCreateDialogProps> = ({
  open,
  memoTypeOptions,
  onClose,
  onCreate,
}) => {
  const [recipientType, setRecipientType] = useState<RecipientType>('All');
  const [selectedRecipients, setSelectedRecipients] = useState<MemoRecipient[]>([{ id: 'ALL', name: 'All Employees', type: 'All' }]);
  const [memoType, setMemoType] = useState<MemoType>('Internal Memo');
  const [dateCreated, setDateCreated] = useState<string>(new Date().toISOString().slice(0, 16));
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [attachmentsRaw, setAttachmentsRaw] = useState<string>('');

  const available = useMemo(() => {
    if (recipientType === 'School') {
      return recipientPool.School;
    }
    if (recipientType === 'Department') {
      return recipientPool.Department;
    }
    if (recipientType === 'Employees') {
      return recipientPool.Employees;
    }
    return [];
  }, [recipientType]);

  React.useEffect(() => {
    if (recipientType === 'All') {
      setSelectedRecipients([{ id: 'ALL', name: 'All Employees', type: 'All' }]);
    } else {
      setSelectedRecipients([]);
    }
  }, [recipientType]);

  React.useEffect(() => {
    if (!open) {
      setRecipientType('All');
      setSelectedRecipients([{ id: 'ALL', name: 'All Employees', type: 'All' }]);
      setMemoType('Internal Memo');
      setDateCreated(new Date().toISOString().slice(0, 16));
      setEffectiveDate('');
      setAgenda('');
      setContent('');
      setAttachmentsRaw('');
    }
  }, [open]);

  const canSubmit = agenda.trim() && content.trim() && effectiveDate && selectedRecipients.length > 0;

  const create = (): void => {
    if (!canSubmit) {
      return;
    }

    const attachments = attachmentsRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const memo: MemoItem = {
      id: `MEMO-${Date.now()}`,
      memoType,
      to: selectedRecipients,
      agenda,
      content,
      attachments,
      dateCreated,
      effectiveDate,
      status: inferMemoStatus(effectiveDate),
      acknowledgements: [],
    };

    onCreate(memo);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-h-[88vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Memo</DialogTitle>
          <DialogDescription>Fill in recipient, memo details, and optional attachments.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className='h-[70vh] overflow-hidden'>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Recipient Type</Label>
                        <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
                            <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                            <SelectContent>
                            {recipientTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Memo Type</Label>
                        <Select value={memoType} onValueChange={(value) => setMemoType(value as MemoType)}>
                            <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select memo type" />
                            </SelectTrigger>
                            <SelectContent>
                            {memoTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Date Created</Label>
                        <Input type="datetime-local" value={dateCreated} onChange={(event) => setDateCreated(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Effectivity Date</Label>
                        <Input type="datetime-local" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                    </div>
                </div>

                {recipientType !== 'All' ? (
                    <RecipientPicker
                    recipientType={recipientType}
                    availableItems={available}
                    selected={selectedRecipients}
                    onChange={setSelectedRecipients}
                    />
                ) : null}

                <div className="space-y-2">
                    <Label>Agenda</Label>
                    <Input value={agenda} onChange={(event) => setAgenda(event.target.value)} placeholder="Memo agenda" />
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write memo content" />
                </div>

                <div className="space-y-2">
                    <Label>Image Attachment (Optional)</Label>
                    <Textarea
                    value={attachmentsRaw}
                    onChange={(event) => setAttachmentsRaw(event.target.value)}
                    placeholder="Paste image URLs, one per line"
                    />
                </div>
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={create} disabled={!canSubmit}>Create Memo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoCreateDialog;
