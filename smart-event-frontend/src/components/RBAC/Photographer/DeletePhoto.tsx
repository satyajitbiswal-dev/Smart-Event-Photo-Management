import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Divider,
  Box
} from "@mui/material";
import { Close, DeleteOutline } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../app/store";
import { deletePhotos } from "../../../app/photoslice";
import { toast } from "react-toastify";

type Props = {
  isDialogOpened: boolean;
  onCloseDialog: () => void;
  photo_ids: string[];
  event_id: string | null;
  onClearSelection: () => void;
};

const DeletePhoto = ({
  isDialogOpened,
  onCloseDialog,
  photo_ids,
  event_id,
  onClearSelection,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    if (!event_id || photo_ids.length === 0) return;

    try {
      await dispatch(
        deletePhotos({
          event_id,
          photo_ids,
        })
      ).unwrap();

      toast.success("Photos deleted successfully 🗑️");
      onClearSelection();
      onCloseDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete photos");
    }
  };

  return (
    <Dialog open={isDialogOpened} onClose={onCloseDialog} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DeleteOutline color="error" />
          <Typography fontWeight={600}>Delete Photos</Typography>
        </Box>

        <IconButton onClick={onCloseDialog} sx={{ borderRadius: 1 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography>
          Are you sure you want to delete{" "}
          <strong>{photo_ids.length}</strong>{" "}
          {photo_ids.length === 1 ? "photo" : "photos"}?
        </Typography>

        <Typography color="error" mt={1} fontSize={13}>
          This action is irreversible. Deleted photos cannot be recovered.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCloseDialog} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePhoto;
