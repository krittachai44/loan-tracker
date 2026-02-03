import * as React from 'react';
import { TableCell, TableRow, Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import type { PaymentLog } from '../utils';

interface PaymentTableRowProps {
  log: PaymentLog;
  onEdit: (paymentId: number) => void;
  onDelete: (paymentId: number) => void;
}

export const PaymentTableRow: React.FC<PaymentTableRowProps> = ({ log, onEdit, onDelete }) => {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {format(log.date, 'dd/MM/yyyy')}
        </Typography>
        {log.note && (
          <Typography variant="caption" color="textSecondary">
            {log.note}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right" sx={{ color: 'success.main' }}>
        {log.amount > 0
          ? `+${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : '-'
        }
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" color="textSecondary">
          {log.rateBreakdown || '-'}
        </Typography>
      </TableCell>
      <TableCell align="right" sx={{ color: 'error.main' }}>
        {log.interest > 0
          ? `-${log.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : '-'
        }
      </TableCell>
      <TableCell align="right" sx={{ color: 'success.dark' }}>
        {log.principalPaid > 0
          ? `-${log.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : '-'
        }
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" fontWeight={700}>
          {log.remainingPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {log.paymentId && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(log.paymentId!)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(log.paymentId!)}
              sx={{ color: 'error.main' }}
            >
              Del
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};
