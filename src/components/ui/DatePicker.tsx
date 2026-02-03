import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';

interface DatePickerProps {
  value?: string; // ISO format (YYYY-MM-DD)
  onChange?: (isoDate: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const DatePicker = ({ value, onChange, required, disabled }: DatePickerProps) => {
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
};

export { DatePicker };

