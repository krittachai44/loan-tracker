import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, format } from 'date-fns';

interface DatePickerProps {
  value?: string; // ISO format (YYYY-MM-DD)
  onChange?: (isoDate: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, onChange, required, disabled }) => {
    const dateValue = value ? parseISO(value) : null;

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          value={dateValue}
          onChange={(newDate) => {
            if (newDate) {
              const isoDate = format(newDate, 'yyyy-MM-dd');
              onChange?.(isoDate);
            }
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              required,
              disabled,
              sx: { minWidth: 140 }
            },
          }}
        />
      </LocalizationProvider>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
