import * as React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Button } from './ui/Button';
import { resetDatabase } from '../db';

interface AppHeaderProps {
    loanName: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ loanName }) => {
    const handleReset = async () => {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            await resetDatabase();
            window.location.reload();
        }
    };

    return (
        <AppBar position="sticky" elevation={1}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        L
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {loanName}
                    </Typography>
                </Box>
                <Button variant="text" size="small" onClick={handleReset} color="error">
                    Reset Data
                </Button>
            </Toolbar>
        </AppBar>
    );
};
