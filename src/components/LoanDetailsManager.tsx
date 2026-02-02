import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { db } from '../db';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePicker } from './ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatNumberInput, parseFormattedNumber } from '../utils';
import type { Loan } from '../types';

interface LoanDetailsManagerProps {
    loan: Loan;
}

export const LoanDetailsManager: React.FC<LoanDetailsManagerProps> = ({ loan }) => {
    const [isEditing, setIsEditing] = React.useState(false);

    // Local state
    const [name, setName] = React.useState(loan.name);
    const [principal, setPrincipal] = React.useState(loan.principal.toString());
    const [isoStartDate, setIsoStartDate] = React.useState(loan.startDate.toISOString().split('T')[0]);

    // Reset when loan changes or edit mode toggles
    React.useEffect(() => {
        if (!isEditing) {
            setName(loan.name);
            setPrincipal(loan.principal.toString());
            setIsoStartDate(loan.startDate.toISOString().split('T')[0]);
        }
    }, [loan, isEditing]);

    const handleSave = async () => {
        if (!name || !principal || !isoStartDate) {
            alert("Please fill in all fields.");
            return;
        }

        if (loan.id) {
            await db.loans.update(loan.id, {
                name,
                principal: parseFloat(parseFormattedNumber(principal)),
                startDate: new Date(isoStartDate)
            });
            setIsEditing(false);
        }
    };

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CardTitle>Loan Details</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    </Box>
                </CardHeader>
                <CardContent sx={{ pt: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Name</Typography>
                            <Typography variant="body2" fontWeight={500}>{loan.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Principal</Typography>
                            <Typography variant="body2" fontWeight={500}>{loan.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="textSecondary">Start Date</Typography>
                            <Typography variant="body2" fontWeight={500}>{format(loan.startDate, 'dd/MM/yyyy')}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Loan Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            label="Loan Name"
                            size="small"
                        />
                    </Box>
                    <Box>
                        <Input
                            type="text"
                            value={principal}
                            onChange={(e) => setPrincipal(formatNumberInput(e.target.value))}
                            onKeyDown={(e) => {
                                // Allow: backspace, delete, tab, escape, enter, decimal point
                                if (["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(e.key) ||
                                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) ||
                                    // Allow: arrow keys
                                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                                    return;
                                }
                                // Prevent if not a number
                                if (!/^[0-9]$/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                e.preventDefault();
                                const pastedText = e.clipboardData.getData('text');
                                const numericOnly = pastedText.replace(/[^0-9.]/g, '');
                                setPrincipal(formatNumberInput(principal.slice(0, (e.target as HTMLInputElement).selectionStart || 0) + numericOnly + principal.slice((e.target as HTMLInputElement).selectionEnd || 0)));
                            }}
                            label="Principal Amount"
                            size="small"
                        />
                    </Box>
                    <Box>
                        <DatePicker
                            value={isoStartDate}
                            onChange={setIsoStartDate}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                        <Button variant="ghost" sx={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button sx={{ flex: 1 }} onClick={handleSave}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
