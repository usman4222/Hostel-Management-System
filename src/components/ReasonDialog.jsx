import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

const ReasonDialog = ({ open, onClose, onSave, studentId, initialReason }) => {
    const [reason, setReason] = useState(initialReason || '');

    const handleSave = () => {
        onSave(studentId, reason);
        setReason('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Enter Reason</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Reason"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReasonDialog;
