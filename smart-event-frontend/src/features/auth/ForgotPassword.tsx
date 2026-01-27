import { CheckCircle } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react'
import { publicapi } from '../../services/AxiosService';
import { toast } from 'react-toastify';

type props = {
    open: boolean,
    onClose: () => void
}

const ForgotPassword = ({ open, onClose }: props) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('')

    const handleEmailError = (email: string) => {
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Enter a valid email');
            return false
        } else {
            setError('');
            return true
        }
    }


    const handleForgotPassword = async () => {
        if (!handleEmailError(email)) return

        try {
            setLoading(true);
            await publicapi.post("/forgot-password/", { email });
            setSuccess(true);
            // toast.success(response.data.message)
        } catch {
            toast.error('Something Went Wrong');
        } finally {
            setLoading(false);
        }
    };

    const restoreState = () => {
        setEmail('')
        setError('')
        setLoading(false)
        setSuccess(false)
    }
    const handleOnClose = () => {
        onClose()
        restoreState()

    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Forgot Password</DialogTitle>

            <DialogContent>
                {!success ? (
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        margin="dense"
                        value={email}
                        error={!!error}
                        helperText={error}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                ) : (
                    <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <CheckCircle color="success" />
                        <Typography>If an account is associated with this email, a new password has been sent.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            {!success && (
                <DialogActions>
                    <Button onClick={handleOnClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!email || loading}
                        onClick={handleForgotPassword}
                    >
                        Send
                    </Button>
                </DialogActions>
            )}
        </Dialog>

    )
}

export default ForgotPassword
