
import React, { useMemo, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../../../../components/ui/dialog';
import { Button } from '../../../../../../components/ui/button';
import { Label } from '../../../../../../components/ui/label';
import { Input } from '../../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import type { DtrFilterState } from '../types';

interface DateFilterDialogProps {
	open: boolean;
	filter: DtrFilterState;
	filterLabel: string;
	onClose: () => void;
	onApply: (nextFilter: DtrFilterState) => void;
}

const DateFilterDialog: React.FC<DateFilterDialogProps> = ({
	open,
	filter,
	filterLabel,
	onClose,
	onApply,
}) => {
	const [draft, setDraft] = useState<DtrFilterState>(filter);

	React.useEffect(() => {
		if (open) {
			setDraft(filter);
		}
	}, [open, filter]);

	const canApply = useMemo(() => {
		if (draft.mode === 'month') {
			return Boolean(draft.month);
		}

		if (draft.mode === 'range') {
			return Boolean(draft.rangeStart && draft.rangeEnd);
		}

		return true;
	}, [draft]);

	const handleApply = (): void => {
		onApply(draft);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Date Filter</DialogTitle>
					<DialogDescription>Set the DTR scope and apply it to the table.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Date Filter</Label>
						<Select
							value={draft.mode}
							onValueChange={(value) =>
								setDraft((current) => ({
									...current,
									mode: value as DtrFilterState['mode'],
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select filter" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="last30">Last 30 Days</SelectItem>
								<SelectItem value="month">Month</SelectItem>
								<SelectItem value="range">Date Range</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{draft.mode === 'month' ? (
						<div className="space-y-2">
							<Label>Month</Label>
							<Input
								type="month"
								value={draft.month}
								onChange={(event) => setDraft((current) => ({ ...current, month: event.target.value }))}
							/>
						</div>
					) : null}

					{draft.mode === 'range' ? (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Start</Label>
								<Input
									type="datetime-local"
									value={draft.rangeStart}
									onChange={(event) =>
										setDraft((current) => ({ ...current, rangeStart: event.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>End</Label>
								<Input
									type="datetime-local"
									value={draft.rangeEnd}
									onChange={(event) => setDraft((current) => ({ ...current, rangeEnd: event.target.value }))}
								/>
							</div>
						</div>
					) : null}

					<p className="text-sm text-muted-foreground">Current value: {filterLabel}</p>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button onClick={handleApply} disabled={!canApply}>Apply Filter</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DateFilterDialog;