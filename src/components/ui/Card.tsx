import * as React from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import MuiTypography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

interface CardProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, sx }, ref) => (
    <MuiCard ref={ref} sx={{ mb: 2, ...sx }}>
      {children}
    </MuiCard>
  )
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, sx }, ref) => (
    <MuiCardContent ref={ref} sx={sx}>
      {children}
    </MuiCardContent>
  )
);

interface CardHeaderProps {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, children, className, sx }, ref) => {
    // If className contains flex, render children directly for custom layout
    const hasFlexLayout = className?.includes('flex');

    if (hasFlexLayout && children) {
      return (
        <Box
          ref={ref}
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...sx
          }}
        >
          {children}
        </Box>
      );
    }

    return (
      <Box ref={ref} sx={{ p: 2, borderBottom: 1, borderColor: 'divider', ...sx }}>
        {title && (
          <MuiTypography variant="h6" component="h2">
            {title}
          </MuiTypography>
        )}
        {children}
      </Box>
    );
  }
);

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const CardTitle = ({ children }: CardTitleProps) => (
  <MuiTypography variant="h6" component="h2">
    {children}
  </MuiTypography>
);


export { Card, CardContent, CardHeader, CardTitle };
