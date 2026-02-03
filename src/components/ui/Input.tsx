import * as React from 'react';
import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';

const Input = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    return (
      <MuiTextField
        ref={ref}
        variant="outlined"
        size="small"
        {...props}
      />
    );
  }
);


export { Input };
export { AmountInput } from './AmountInput';
export type { TextFieldProps as InputProps } from '@mui/material/TextField';
