import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';

const ReasonDialog = ({ open, onClose, onSave, studentId, initialReason }) => {
    const [reason, setReason] = useState(initialReason || '');
    const { enqueueSnackbar } = useSnackbar();
    const [error, setError] = useState("")

    const handleSave = () => {
        if (reason.trim() === '') {
            setError('Reason cannot be empty');
            enqueueSnackbar("Please enter a reason before saving.", { variant: "warning" });
            return;
        }
        onSave(studentId, reason);
        setReason('');
        setError('');
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
