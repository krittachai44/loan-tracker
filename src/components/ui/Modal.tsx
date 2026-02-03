import * as React from 'react';
import { createPortal } from 'react-dom';
import { Box } from '@mui/material';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 'lg' }}>
        <Card sx={{ boxShadow: 24 }}>
          <CardHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardTitle>{title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} sx={{ minWidth: 24, height: 24, p: 0 }}>
                X
              </Button>
            </Box>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </Box>
    </Box>,
    document.body
  );
};
