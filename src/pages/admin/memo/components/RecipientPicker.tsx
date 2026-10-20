import React, { useMemo, useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import type { MemoRecipient, RecipientType } from '../types';

interface RecipientPickerProps {
  recipientType: RecipientType;
  availableItems: Array<{ id: string; name: string; position?: string; avatarUrl?: string; meta?: string }>;
  selected: MemoRecipient[];
  onChange: (selected: MemoRecipient[]) => void;
}

const RecipientPicker: React.FC<RecipientPickerProps> = ({
  recipientType,
  availableItems,
  selected,
  onChange,
}) => {
  const [search, setSearch] = useState<string>('');

  const selectedMap = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return availableItems.filter((item) => {
      if (!term) {
        return true;
      }

      const meta = item.meta?.toLowerCase() ?? '';
      return item.name.toLowerCase().includes(term) || meta.includes(term);
    });
  }, [availableItems, search]);

  const addOne = (item: { id: string; name: string; position?: string; avatarUrl?: string; meta?: string }): void => {
    if (selectedMap.has(item.id)) {
      return;
    }
    onChange([...selected, { ...item, type: recipientType }]);
  };

  const addAll = (): void => {
    const next = [...selected];
    visibleItems.forEach((item) => {
      if (!selectedMap.has(item.id)) {
        next.push({ ...item, type: recipientType });
      }
    });
    onChange(next);
  };

  const removeOne = (id: string): void => {
    onChange(selected.filter((item) => item.id !== id));
  };

  const removeAll = (): void => onChange([]);

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${recipientType}`} />
        <Button type="button" variant="outline" size="sm" onClick={addAll}>
          <Plus className="h-4 w-4" />
          Add All
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={removeAll}>Remove All</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Available ({visibleItems.length})</p>
          <ScrollArea className="h-44 rounded-md border p-2">
            <div className="space-y-1">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addOne(item)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                >
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="truncate">{item.name}</span>
                    {item.meta ? (
                      <span className="truncate text-[11px] text-muted-foreground">{item.meta}</span>
                    ) : null}
                  </span>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Selected ({selected.length})</p>
          </div>
          <ScrollArea className="h-44 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {selected.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recipients selected.</p>
              ) : selected.map((item) => (
                <Badge key={item.id} variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  <span className="flex flex-col items-start">
                    <span className="leading-tight">{item.name}</span>
                    {item.meta ? (
                      <span className="text-[10px] text-muted-foreground">{item.meta}</span>
                    ) : null}
                  </span>
                  <button type="button" onClick={() => removeOne(item.id)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default RecipientPicker;
