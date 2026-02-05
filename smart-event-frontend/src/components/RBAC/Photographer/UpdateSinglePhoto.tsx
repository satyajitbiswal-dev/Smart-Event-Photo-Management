import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel,IconButton,
  Radio, RadioGroup, TextField, Typography,} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchEvents } from "../../../app/eventslice";
import { fetchUsers } from "../../../app/userslice";
import { fetchPhotoDetails, photoSingleUpdate } from "../../../app/photoslice";
import type { User, Event as AppEvent, Photo } from "../../../types/types";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onClose: () => void;
  photo_id: string;
};

const UpdateSinglePhoto = ({ open, onClose, photo_id }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const photo: Photo | undefined = useSelector(
    (state: RootState) => state.photo.photosById[photo_id]
  );

  const authUser = useSelector((state: RootState) => state.auth.user);
  const eventlist = useSelector((state: RootState) => state.event.events);
  const userlist = useSelector((state: RootState) => state.user.userlist);

  /*  local state (prefilled)  */
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<string>("as_previous");
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  /* fetch deps */
  useEffect(() => {
    if (!photo) {
      dispatch(fetchPhotoDetails(photo_id));
    }
    if (eventlist.length === 0) dispatch(fetchEvents());
    if (userlist.length === 0) dispatch(fetchUsers());
  }, [dispatch, photo, photo_id, eventlist, userlist]);

  /*  prefill when photo arrives */
  useEffect(() => {
    if (!photo) return;

    setTags(photo.tag ?? []);

    setTaggedUsers(userlist.filter((u) =>
        photo.tagged_user?.includes(u.email)
      )
    );

    setPrivacy(photo.is_private ? "private" : "public");

    setSelectedEvent(
      eventlist.find((e) => e.id === photo.event) ?? null
    );
  }, [photo, userlist, eventlist]);

  /*  handlers */
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean));
  };

  const handleUpdate = async () => {
    try {
      if (!photo) return;

      const data: any = {};

      data.tags = tags;
      data.tagged_user = taggedUsers.map(u => u.email);
      data.is_private = privacy === "private";

      if (selectedEvent && selectedEvent.id !== photo.event) {
        data.event = selectedEvent.id;
      }

      await dispatch(photoSingleUpdate({photo_id,data,})
      ).unwrap();
      toast.success("Photo updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update photo");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <Typography>Update Photo</Typography>
        <IconButton onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Move Event */}
        <Typography variant="caption" color="text.secondary">
          Move to Event
        </Typography>
        <Autocomplete
          fullWidth
          value={selectedEvent}
          onChange={(_, v) => setSelectedEvent(v)}
          options={eventlist.filter(
            (e) => e.event_photographer === authUser?.email
          )}
          getOptionLabel={(o) => o.event_name}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select event" />
          )}
        />

        {/* Tagged Users */}
        <Typography mt={2} variant="caption" color="text.secondary">
          Tagged Users
        </Typography>
        <Autocomplete
          fullWidth
          multiple
          value={taggedUsers}
          onChange={(_, v) => setTaggedUsers(v)}
          options={userlist}
          getOptionLabel={(o) => o.username}
          renderInput={(params) => (
            <TextField {...params} placeholder="Tag users" />
          )}
        />

        {/* Privacy */}
        <FormControl sx={{ mt: 2 }}>
          <FormLabel>Privacy</FormLabel>
          <RadioGroup
            row
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <FormControlLabel value="public" control={<Radio />} label="Public" />
            <FormControlLabel value="private" control={<Radio />} label="Private" />
          </RadioGroup>
        </FormControl>

        {/* Tags */}
        <TextField
          label="Tags"
          fullWidth
          margin="normal"
          value={tags.join(",")}
          onChange={handleTagChange}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleUpdate}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateSinglePhoto;
