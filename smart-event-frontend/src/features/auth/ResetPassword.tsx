import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from "@mui/material";
import { useState } from "react";
// import axios from "@/utils/axios";
import { toast } from "react-toastify";
import privateapi from "../../services/AxiosService";

type props ={
    open:boolean,
    onClose: () => void
}

const ResetPasswordDialog = ({ open, onClose }:props) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const passwordError =
  password.length > 0 && password.length < 8
    ? "Password must be at least 8 characters"
    : "";

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await privateapi.post("/reset-password/", {
        password,
        confirm_password: confirm,
      });

      toast.success("Password reset successful");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reset Password</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          type="password"
          label="New Password"
          error={!!passwordError}
          helperText={passwordError}
          margin="dense"
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          margin="dense"
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
