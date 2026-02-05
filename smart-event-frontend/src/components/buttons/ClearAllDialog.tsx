import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress,} from "@mui/material";
import { useState } from "react";
import privateapi from "../../services/AxiosService";

type Props = {
  open: boolean;
  onClose: () => void;
  onCleared?: () => void; 
};

export default function ClearAllNotificationsDialog({ open, onClose, onCleared,}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    try {
      setLoading(true);
      await privateapi.delete("/notification/clear-all/");
      onCleared?.(); // let parent reset redux / refetch
      onClose();
    } catch (err) {
      console.error("Failed to clear notifications", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Clear all notifications?</DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">
          This will permanently remove all notifications.<br />
          You can’t undo this action.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleClearAll}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Clear All
        </Button>
      </DialogActions>
    </Dialog>
  );
}
