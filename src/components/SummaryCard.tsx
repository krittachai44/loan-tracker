import * as React from 'react';
import { Typography } from '@mui/material';
import { Card, CardContent } from './ui/Card';

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    valueColor?: string;
    gradient?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    subtitle,
    valueColor,
    gradient
}) => {
    const isGradient = !!gradient;

    return (
        <Card sx={isGradient ? {
            background: gradient,
            color: 'white'
        } : undefined}>
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="caption"
                    sx={isGradient ? { opacity: 0.8, display: 'block', mb: 1 } : { display: 'block', mb: 1 }}
                    color={isGradient ? undefined : 'textSecondary'}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: valueColor
                    }}
                >
                    {typeof value === 'number'
                        ? value.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : value
                    }
                </Typography>
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={isGradient ? { opacity: 0.7 } : undefined}
                        color={isGradient ? undefined : 'textSecondary'}
                    >
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
