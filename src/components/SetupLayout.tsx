import * as React from 'react';
import { Box } from '@mui/material';
import { LoanSetup } from './LoanSetup';
import { MRRManager } from './MRRManager';

export const SetupLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', gap: 6, p: 6, minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Left Side - Setup Form */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <LoanSetup onComplete={() => { }} />
            </Box>
            
            {/* Right Side - MRR Manager */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400 }}>
                <MRRManager />
            </Box>
        </Box>
    );
};
