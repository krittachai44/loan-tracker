import * as React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { PaymentLog } from '../utils';
import type { Payment } from '../types';
import { db } from '../db';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { PaymentForm } from './PaymentForm';
import { YearFilter } from './YearFilter';
import { PaymentTableRow } from './PaymentTableRow';

interface PaymentListProps {
  logs: PaymentLog[];
}

export const PaymentList: React.FC<PaymentListProps> = ({ logs }) => {
  const [editingPayment, setEditingPayment] = React.useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = React.useState<number | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<number | 'ALL'>('ALL');

  const availableYears = (() => {
    const years = new Set(logs.map(log => log.date.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  })();

  const history = (() => {
    let sorted = [...logs].reverse();
    if (selectedYear !== 'ALL') {
      sorted = sorted.filter(log => log.date.getFullYear() === selectedYear);
    }
    return sorted;
  })();

  const handleEdit = async (paymentId: number) => {
    const payment = await db.payments.get(paymentId);
    if (payment) {
      setEditingPayment(payment);
    }
  };

  const handleDelete = (paymentId: number) => {
    setDeletingPaymentId(paymentId);
  };

  const confirmDelete = async () => {
    if (deletingPaymentId) {
      await db.payments.delete(deletingPaymentId);
      setDeletingPaymentId(null);
    }
  };

  // Handle keyboard shortcuts for delete confirmation modal
  React.useEffect(() => {
    if (!deletingPaymentId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        confirmDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletingPaymentId, confirmDelete]);

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
                  <TableCell
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Rate (Days)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Interest Paid
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Principal
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    Actions
                  </TableCell>
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

      <Modal
        isOpen={!!deletingPaymentId}
        onClose={() => setDeletingPaymentId(null)}
        title="Delete Payment"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            Are you sure you want to delete this payment? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setDeletingPaymentId(null)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
