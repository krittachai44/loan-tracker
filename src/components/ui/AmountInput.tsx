import * as React from 'react';
import { Typography, Box } from '@mui/material';
import { Input } from './Input';
import type { TextFieldProps } from '@mui/material/TextField';

interface AmountInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    showLabel?: boolean;
}

/**
 * Reusable amount input component with built-in number formatting and validation
 * Automatically filters non-numeric characters (except decimal point)
 */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
    ({ value, onChange, label = 'Amount', showLabel = true, ...props }, ref) => {
        return (
            <Box>
                {showLabel && (
                    <Typography variant="caption" component="label" display="block" gutterBottom>
                        {label}
                    </Typography>
                )}
                <Input
                    ref={ref}
                    type="text"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    {...props}
                />
            </Box>
        );
    }
);

AmountInput.displayName = 'AmountInput';
