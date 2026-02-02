import * as React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { PaymentLog } from '../utils';
import type { Payment } from '../types';
import { db } from '../db';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Modal } from './ui/Modal';
import { PaymentForm } from './PaymentForm';
import { YearFilter } from './YearFilter';
import { PaymentTableRow } from './PaymentTableRow';

interface PaymentListProps {
    logs: PaymentLog[];
}

export const PaymentList: React.FC<PaymentListProps> = ({ logs }) => {
    const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null);
    const [selectedYear, setSelectedYear] = React.useState<number | 'ALL'>('ALL');

    const availableYears = React.useMemo(() => {
        const years = new Set(logs.map(log => log.date.getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [logs]);

    const history = React.useMemo(() => {
        let sorted = [...logs].reverse();
        if (selectedYear !== 'ALL') {
            sorted = sorted.filter(log => log.date.getFullYear() === selectedYear);
        }
        return sorted;
    }, [logs, selectedYear]);

    const handleEdit = async (paymentId: number) => {
        const payment = await db.payments.get(paymentId);
        if (payment) {
            setEditingPayment(payment);
        }
    };

    const handleDelete = async (paymentId: number) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            await db.payments.delete(paymentId);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CardTitle>Payment History</CardTitle>
                        <YearFilter
                            availableYears={availableYears}
                            selectedYear={selectedYear}
                            onYearChange={setSelectedYear}
                        />
                    </Box>
                </CardHeader>
                <CardContent>
                    <TableContainer sx={{ maxHeight: 'calc(20 * 53px)', overflowY: 'auto' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Payment</TableCell>
                                    <TableCell align="right">Rate (Days)</TableCell>
                                    <TableCell align="right">Interest Paid</TableCell>
                                    <TableCell align="right">Principal</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((log, index) => (
                                    <PaymentTableRow
                                        key={index}
                                        log={log}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Modal
                isOpen={!!editingPayment}
                onClose={() => setEditingPayment(null)}
                title="Edit Payment"
            >
                {editingPayment && (
                    <PaymentForm
                        loanId={editingPayment.loanId}
                        initialPayment={editingPayment}
                        onComplete={() => setEditingPayment(null)}
                    />
                )}
            </Modal>
        </>
    );
};
