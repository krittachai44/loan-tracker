import * as React from 'react';
import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inherit' | 'text' | 'contained' | 'dashed';
    size?: 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'medium', ...props }, ref) => {
        let muiVariant: MuiButtonProps['variant'] = 'contained';
        let color: MuiButtonProps['color'] = 'primary';
        
        // Map custom sizes to MUI sizes
        let muiSize: MuiButtonProps['size'] = 'medium';
        if (size === 'sm' || size === 'small') muiSize = 'small';
        else if (size === 'md' || size === 'medium') muiSize = 'medium';
        else if (size === 'lg' || size === 'large') muiSize = 'large';

        switch (variant) {
            case 'secondary':
                muiVariant = 'contained';
                color = 'secondary';
                break;
            case 'outline':
                muiVariant = 'outlined';
                color = 'primary';
                break;
            case 'ghost':
                muiVariant = 'text';
                color = 'primary';
                break;
            case 'danger':
                muiVariant = 'contained';
                color = 'error';
                break;
            default:
                muiVariant = 'contained';
                color = 'primary';
        }

        return (
            <MuiButton
                ref={ref}
                variant={muiVariant}
                color={color}
                size={muiSize}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
