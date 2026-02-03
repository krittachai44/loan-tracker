import * as React from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subMonths } from 'date-fns';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import type { PaymentLog } from '../utils';

interface LoanGraphProps {
  data: PaymentLog[];
}

type TimePeriod = 'all' | '1y' | '6m' | '3m' | '1m';

export const LoanGraph: React.FC<LoanGraphProps> = ({ data }) => {
  const [period, setPeriod] = React.useState<TimePeriod>('all');

  // Filter data based on selected period
  const filteredData = (() => {
    if (period === 'all' || data.length === 0) return data;

    const now = new Date();
    let cutoffDate: Date;

    switch (period) {
      case '1y':
        cutoffDate = subMonths(now, 12);
        break;
      case '6m':
        cutoffDate = subMonths(now, 6);
        break;
      case '3m':
        cutoffDate = subMonths(now, 3);
        break;
      case '1m':
        cutoffDate = subMonths(now, 1);
        break;
      default:
        return data;
    }

    return data.filter(item => item.date >= cutoffDate);
  })();

  // Format data for chart - add index for unique identification
  const chartData = filteredData.map((item, index) => ({
    ...item,
    index,
    formattedDate: format(item.date, 'dd/MM'),
    fullDate: format(item.date, 'dd/MM/yyyy'),
    balance: parseFloat(item.remainingPrincipal.toFixed(2)),
    interestPaid: parseFloat(item.interest.toFixed(2)),
  }));

  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: TimePeriod | null) => {
    if (newPeriod) setPeriod(newPeriod);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <TrendingDownOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3 }}>
              Loan Progress
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Track your principal reduction over time
            </Typography>
          </Box>
        </Box>

        {/* Period Toggle */}
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.75,
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }
            }
          }}
        >
          <ToggleButton value="1m">1M</ToggleButton>
          <ToggleButton value="3m">3M</ToggleButton>
          <ToggleButton value="6m">6M</ToggleButton>
          <ToggleButton value="1y">1Y</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 400, width: '100%', mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              dy={8}
              tickFormatter={(value) => {
                const item = chartData[value];
                return item ? item.formattedDate : '';
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tickFormatter={(value) => `${value.toLocaleString()}`}
              dx={-8}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return String(label);
              }}
              formatter={(value: number | undefined) => 
                value !== undefined 
                  ? [
                      value.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      }),
                      'Remaining Principal'
                    ]
                  : ['', '']
              }
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorBalance)"
              name="Remaining Principal"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
