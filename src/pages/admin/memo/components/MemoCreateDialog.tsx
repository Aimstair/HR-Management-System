import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import type { MemoItem, MemoRecipient, MemoType, RecipientType } from '../types';
import { ACKNOWLEDGEMENT_REQUIRED_MEMO_TYPES, inferMemoStatus } from '../utils';
import RecipientPicker from './RecipientPicker';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import { uploadAdminMemoAttachments } from '../../../../lib/admin-api';

interface MemoCreateDialogProps {
  open: boolean;
  recipientPool: {
    Campus: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
    School: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
    Department: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
    Employees: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
  };
  recipientTypeOptions: readonly RecipientType[];
  memoTypeOptions: readonly MemoType[];
  onClose: () => void;
  onCreate: (memo: MemoItem) => Promise<boolean>;
  isSubmitting?: boolean;
}

const MemoCreateDialog: React.FC<MemoCreateDialogProps> = ({
  open,
  recipientPool,
  recipientTypeOptions,
  memoTypeOptions,
  onClose,
  onCreate,
  isSubmitting = false,
}) => {
  const [recipientType, setRecipientType] = useState<RecipientType>('All');
  const [selectedRecipients, setSelectedRecipients] = useState<MemoRecipient[]>([{ id: 'ALL', name: 'All Employees', type: 'All' }]);
  const [memoType, setMemoType] = useState<MemoType>('Internal Memo');
  const [dateCreated, setDateCreated] = useState<string>(new Date().toISOString().slice(0, 16));
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [agenda, setAgenda] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const maxAttachments = 5;
  const maxAttachmentSize = 10 * 1024 * 1024;

  const available = useMemo(() => {
    if (recipientType === 'Campus') {
      return recipientPool.Campus;
    }
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
  }, [recipientPool, recipientType]);

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
      setAttachmentFiles([]);
      setAttachmentError(null);
      setIsUploading(false);
      setIsSaving(false);
    }
  }, [open]);

  const canSubmit = agenda.trim() && content.trim() && effectiveDate && selectedRecipients.length > 0;

  const create = async (): Promise<void> => {
    if (!canSubmit || isSaving || isSubmitting) {
      return;
    }

    if (attachmentError) {
      toast.error(attachmentError);
      return;
    }

    setIsSaving(true);

    try {
      let attachments: string[] = [];

      if (attachmentFiles.length > 0) {
        setIsUploading(true);
        try {
          const response = await uploadAdminMemoAttachments(attachmentFiles);
          attachments = response.attachments;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to upload attachments.';
          toast.error(message);
          return;
        } finally {
          setIsUploading(false);
        }
      }

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

      const created = await onCreate(memo);
      if (created) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      setAttachmentFiles([]);
      setAttachmentError(null);
      return;
    }

    const tooLarge = files.find((file) => file.size > maxAttachmentSize);
    if (tooLarge) {
      setAttachmentFiles([]);
      setAttachmentError('Each attachment must be 10MB or less.');
      return;
    }

    if (files.length > maxAttachments) {
      setAttachmentFiles(files.slice(0, maxAttachments));
      setAttachmentError(`Only ${maxAttachments} attachments are allowed.`);
      return;
    }

    setAttachmentFiles(files);
    setAttachmentError(null);
  };

  const removeAttachment = (index: number): void => {
    setAttachmentFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
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
                        <p className="text-xs text-muted-foreground">
                            {ACKNOWLEDGEMENT_REQUIRED_MEMO_TYPES.has(memoType)
                                ? 'Recipients must acknowledge this memo.'
                                : 'Informational memo; recipients do not need to acknowledge it.'}
                        </p>
                    </div>

                    {/* <div className="space-y-2">
                        <Label>Date Created</Label>
                        <Input type="datetime-local" value={dateCreated} onChange={(event) => setDateCreated(event.target.value)} />
                    </div> */}

                    <div className="space-y-2 col-span-2">
                        <Label>Date Active</Label>
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
                    <Label>File Attachments (Optional)</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleFileChange}
                      disabled={isSaving || isSubmitting || isUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Up to {maxAttachments} files, 10MB each. Images, PDFs, and office docs are supported.
                    </p>
                    {attachmentError ? (
                      <p className="text-xs text-destructive">{attachmentError}</p>
                    ) : null}
                    {attachmentFiles.length > 0 ? (
                      <div className="space-y-2">
                        {attachmentFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border p-2 text-xs">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{file.name}</p>
                              <p className="text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => removeAttachment(index)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                </div>
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving || isSubmitting || isUploading}>Cancel</Button>
          <Button onClick={create} disabled={!canSubmit || isSaving || isSubmitting || isUploading}>Create Memo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoCreateDialog;
