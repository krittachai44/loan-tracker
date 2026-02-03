import * as React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { TrendingUp, TrendingDown, AttachMoney, Schedule } from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle?: string;
  valueColor?: string;
  gradient?: string;
  icon?: 'up' | 'down' | 'money' | 'time';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  valuePrefix,
  valueSuffix,
  subtitle,
  valueColor,
  gradient,
  icon
}) => {
  const isGradient = !!gradient;

  const renderIcon = () => {
    if (!icon) return null;
    const iconProps = { sx: { fontSize: 24, opacity: 0.9 } };

    switch (icon) {
      case 'up': return <TrendingUp {...iconProps} />;
      case 'down': return <TrendingDown {...iconProps} />;
      case 'money': return <AttachMoney {...iconProps} />;
      case 'time': return <Schedule {...iconProps} />;
      default: return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...(isGradient ? {
          background: gradient,
          color: 'white',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
          border: 'none'
        } : {
          border: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.1)',
          backgroundColor: 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.2)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
            transform: 'translateY(-2px)'
          }
        })
      }}
    >
      {/* Decorative element */}
      {isGradient && (
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)'
          }}
        />
      )}

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header with icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              ...(isGradient ? {
                opacity: 0.95
              } : {
                color: 'text.secondary'
              })
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{
              ...(isGradient ? {
                color: 'rgba(255, 255, 255, 0.9)'
              } : {
                color: 'primary.main'
              })
            }}>
              {renderIcon()}
            </Box>
          )}
        </Box>

        {/* Value */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            mb: subtitle ? 1.5 : 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: valueColor
          }}
        >
          {valuePrefix}
          {typeof value === 'number'
            ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value
          }
          {valueSuffix}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              ...(isGradient ? {
                opacity: 0.85
              } : {
                color: 'text.secondary'
              })
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
