import * as React from 'react';
import { Box } from '@mui/material';
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import type { PaymentLog } from '../utils';

interface LoanGraphProps {
    data: PaymentLog[];
}

type TimePeriod = 'all' | '1y' | '6m' | '3m' | '1m';

export const LoanGraph: React.FC<LoanGraphProps> = ({ data }) => {
    const [period, setPeriod] = React.useState<TimePeriod>('all');

    // Filter data based on selected period
    const filteredData = React.useMemo(() => {
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
    }, [data, period]);

    // Format data for chart
    const chartData = React.useMemo(() => filteredData.map(item => ({
        ...item,
        formattedDate: format(item.date, 'dd/MM'),
        fullDate: format(item.date, 'dd/MM/yyyy'),
        balance: parseFloat(item.remainingPrincipal.toFixed(2)),
        interestPaid: parseFloat(item.interest.toFixed(2)),
    })), [filteredData]);

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CardTitle>Loan Progress</CardTitle>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant={period === '1m' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('1m')}
                        >
                            1M
                        </Button>
                        <Button
                            variant={period === '3m' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('3m')}
                        >
                            3M
                        </Button>
                        <Button
                            variant={period === '6m' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('6m')}
                        >
                            6M
                        </Button>
                        <Button
                            variant={period === '1y' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('1y')}
                        >
                            1Y
                        </Button>
                        <Button
                            variant={period === 'all' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('all')}
                        >
                            All
                        </Button>
                    </Box>
                </Box>
            </CardHeader>
            <CardContent>
                <Box sx={{ height: 400, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label) => String(label)}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#16a34a"
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                name="Remaining Principal"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
