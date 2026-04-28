import React from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import { Textarea } from '../../../../../components/ui/textarea';
import type {
  EmployeeRequestFields,
  EmployeeRequestType,
} from '../../shared/employeePortalTypes';
import {
  getRequestFormSchema,
  type RequestFieldDefinition,
  getRequestTypeLabel,
} from '../requestConfig';
import { EmployeeType } from '../../../../types';

interface RequestFilingDialogProps {
  open: boolean;
  requestType: EmployeeRequestType;
  employeeType: EmployeeType;
  onClose: () => void;
  onSubmit: (fields: EmployeeRequestFields) => void;
}

const createInitialValues = (
  requestType: EmployeeRequestType,
  employeeType: EmployeeType,
): EmployeeRequestFields => {
  const schema = getRequestFormSchema(requestType, employeeType);
  return schema.reduce<EmployeeRequestFields>((acc, field) => {
    acc[field.key] = field.type === 'file' ? [] : '';
    return acc;
  }, {});
};

const isValueEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return String(value).trim().length === 0;
};

const RequestFilingDialog: React.FC<RequestFilingDialogProps> = ({
  open,
  requestType,
  employeeType,
  onClose,
  onSubmit,
}) => {
  const schema = React.useMemo(
    () => getRequestFormSchema(requestType, employeeType),
    [requestType, employeeType],
  );
  const [values, setValues] = React.useState<EmployeeRequestFields>(() => createInitialValues(requestType, employeeType));
  const [validationError, setValidationError] = React.useState<string>('');

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setValues(createInitialValues(requestType, employeeType));
    setValidationError('');
  }, [open, requestType, employeeType]);

  const updateValue = (key: string, value: EmployeeRequestFields[string]): void => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validate = (): boolean => {
    const missing = schema.find((field) => field.required && isValueEmpty(values[field.key]));
    if (!missing) {
      setValidationError('');
      return true;
    }

    setValidationError(`${missing.label} is required.`);
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    onSubmit(values);
  };

  const renderField = (field: RequestFieldDefinition): React.ReactNode => {
    const rawValue = values[field.key];
    const value = rawValue === null || rawValue === undefined ? '' : String(rawValue);

    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.key}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => updateValue(field.key, event.target.value)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <Select value={value} onValueChange={(next) => updateValue(field.key, next)}>
          <SelectTrigger id={field.key}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'file') {
      return (
        <Input
          id={field.key}
          type="file"
          onChange={(event) => {
            const files = event.target.files;
            updateValue(
              field.key,
              files ? Array.from(files).map((item) => item.name) : [],
            );
          }}
        />
      );
    }

    return (
      <Input
        id={field.key}
        type={field.type}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => updateValue(field.key, event.target.value)}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>File {getRequestTypeLabel(requestType)} Request</DialogTitle>
          <DialogDescription>
            Complete the fields below to file your request.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh] pr-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {schema.map((field) => (
                <div
                  key={field.key}
                  className={field.type === 'textarea' ? 'space-y-2 md:col-span-2' : 'space-y-2'}
                >
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.optional ? ' (Optional)' : ''}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {validationError ? (
              <p className="text-sm text-destructive">{validationError}</p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RequestFilingDialog;
