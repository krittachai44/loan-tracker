import * as React from 'react';
import MuiTextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';

const Input = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const { onKeyDown, onPaste, inputProps, ...otherProps } = props;

    return (
      <MuiTextField
        ref={ref}
        variant="outlined"
        size="small"
        {...otherProps}
        inputProps={{
          ...inputProps,
          onKeyDown: onKeyDown as any,
          onPaste: onPaste as any,
        }}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
