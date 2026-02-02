import * as React from 'react';
import { 
    Box, 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Tooltip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Paper,
    Divider
} from '@mui/material';
import { FileUpload, HelpOutline, Download, Info } from '@mui/icons-material';
import { LoanSetup } from './LoanSetup';
import { MRRManager } from './MRRManager';
import { useCSVImport } from '../hooks/useCSVImport';
import { ACCEPTED_FILE_TYPES, SAMPLE_CSV_DATA } from '../constants/csv';

export const SetupLayout: React.FC = () => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [sampleDialogOpen, setSampleDialogOpen] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const { importFromFile, isImporting } = useCSVImport();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await importFromFile(file);
            
            if (result.success) {
                setSnackbar({
                    open: true,
                    message: 'Data imported successfully! Redirecting...',
                    severity: 'success'
                });
                
                // Ensure database transaction is fully committed before reload
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.reload();
            } else {
                setSnackbar({
                    open: true,
                    message: result.error || 'Failed to import data',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Import error:', error);
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : 'Failed to import data',
                severity: 'error'
            });
        } finally {
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDownloadSample = () => {
        const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'loan-tracker-sample.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setSnackbar({
            open: true,
            message: 'Sample CSV downloaded!',
            severity: 'success'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header Bar */}
            <AppBar 
                position="sticky" 
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid',
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    color: 'text.primary'
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        {/* Logo Icon */}
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            <FileUpload sx={{ fontSize: 22 }} />
                        </Box>
                        
                        {/* Title */}
                        <Box>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                Loan Tracker
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700,
                                    fontSize: '1.125rem',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.2
                                }}
                            >
                                Initial Setup
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Tooltip title="View Sample Format">
                            <IconButton 
                                onClick={() => setSampleDialogOpen(true)}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <HelpOutline fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Import CSV Data">
                            <IconButton 
                                onClick={handleUploadClick}
                                size="small"
                                sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.08)'
                                    }
                                }}
                            >
                                <FileUpload fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={isImporting}
                    />
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ display: 'flex', gap: 6, p: 6 }}>
                {/* Left Side - Setup Form */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <LoanSetup onComplete={() => { }} />
                </Box>
                
                {/* Right Side - MRR Manager */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400 }}>
                    <MRRManager />
                </Box>
            </Box>

            {/* Sample Format Dialog */}
            <Dialog
                open={sampleDialogOpen}
                onClose={() => setSampleDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5,
                    pb: 2
                }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main'
                        }}
                    >
                        <Info />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            CSV Import Format
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Follow this structure to import your loan data
                        </Typography>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            bgcolor: 'grey.50',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            overflow: 'auto',
                            maxHeight: '60vh'
                        }}
                    >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{SAMPLE_CSV_DATA}
                        </pre>
                    </Paper>
                    
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                            📋 Format Guidelines:
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ color: 'text.secondary' }}>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                <li><strong>Sections</strong> start with # (LOAN DETAILS, RATE SEGMENTS, REFERENCE RATES, PAYMENT HISTORY)</li>
                                <li><strong>Rate Type</strong> can be "fixed" (fixed rate) or "float" (variable rate with margin)</li>
                                <li><strong>Date Format</strong> must be YYYY-MM-DD (e.g., 2024-01-01)</li>
                                <li><strong>Numbers</strong> should not include commas or currency symbols</li>
                                <li><strong>File Types</strong> supported: .csv, .xlsx, .xls</li>
                            </ul>
                        </Typography>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button 
                        onClick={handleDownloadSample}
                        startIcon={<Download />}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Download Sample
                    </Button>
                    <Button 
                        onClick={() => setSampleDialogOpen(false)}
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Got It
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
