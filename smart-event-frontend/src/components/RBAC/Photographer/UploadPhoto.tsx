import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Stack,
    TextField,
    Typography,
    Autocomplete,
    Paper
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchEvents, selectEvent } from "../../../app/eventslice";
import { fetchUsers } from "../../../app/userslice";
import { all } from "axios";
import type { User } from "../../../types/types";
// import { jsonToFormData } from "../../../features/JsonToFormData";
import { addPhotos } from "../../../app/photoslice";

/* ---------------- types ---------------- */


/* ---------------- component ---------------- */
export default function UploadPhoto() {
    const { event_id } = useParams()
    const allEvents = useSelector((state: RootState) => state.event.events)
    const selectedEvent = allEvents.find((e) => e.id === event_id) || null
    const users = useSelector((state: RootState) => state.user.userlist)
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (allEvents.length === 0) dispatch(fetchEvents())
        if (users.length === 0) dispatch(fetchUsers())
    }, [allEvents, users, dispatch])


    const navigate = useNavigate();

    const [files, setFiles] = useState<File[]>([]);
    const [manualTags, setManualTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
    const handleUserListOnChange = (event: React.SyntheticEvent, newValue: User[]) => {
        setTaggedUsers(newValue)
    }

    //    react drop zone
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: true
    });

    // manual tags
    const handleAddTag = () => {
        if (tagInput.trim() && !manualTags.includes(tagInput.trim())) {
            setManualTags([...manualTags, tagInput.trim()]);
            setTagInput("");
        }
    };

    if (!selectedEvent) return <Typography>No Event Selected</Typography>

    const clearInputs = () => {
        setFiles([])
        setManualTags([])
        setTaggedUsers([])
    }
    // submit button
    
    const handleUpload = async() => {
        if(!event_id) return; 
        const payload = {
            uploaded_photos: files,
            tags: manualTags,
            tagged_users: taggedUsers.map((e) => e.email)
            };
            try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append("uploaded_photos", file);
            });
            formData.append("event_id", selectedEvent.id);
            manualTags.forEach(t => formData.append("tags", t));
            taggedUsers.forEach(u => formData.append("tagged_users", u.email));
            await dispatch(addPhotos({data:formData, event_id:event_id})).unwrap()
            clearInputs()
        } catch (error) {
            console.log(error);
            
        }
    };



    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack
                direction={'row'}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        Add Photos
                    </Typography>
                    <Typography color="text.secondary">
                        Event: <strong>{selectedEvent.event_name} - {selectedEvent.event_date}</strong>
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<PhotoLibraryIcon />}
                    onClick={() => navigate(`update_delete/`)}
                >
                    Manage Photos
                </Button>
            </Stack>

            {/* ---------- dropzone ---------- */}
            <Paper
                {...getRootProps()}
                sx={{
                    p: 4,
                    border: "2px dashed",
                    borderColor: isDragActive ? "primary.main" : "grey.400",
                    textAlign: "center",
                    cursor: "pointer",
                    mb: 4
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon fontSize="large" color="primary" />
                <Typography mt={1}>
                    {isDragActive
                        ? "Drop photos here..."
                        : "Drag & drop photos here, or click to upload"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Supports multiple images
                </Typography>
            </Paper>
            {/* ---------- preview section ---------- */}
            {files.length > 0 && (
                <Box mb={4}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography fontWeight={600}>
                            Selected Photos ({files.length})
                        </Typography>

                        <Button
                            size="small"
                            color="error"
                            onClick={() => setFiles([])}
                        >
                            Clear all
                        </Button>
                    </Stack>

                    <Grid container spacing={2}>
                        {files.map((file, index) => (
                            <Grid size={{ xs: 2, sm: 2, md: 1 }} key={index}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: "100%",
                                        paddingTop: "100%", // square
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: 1,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />

                                    {/* remove single image */}
                                    <Button
                                        size="small"
                                        color="error"
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            minWidth: 0,
                                            padding: "2px 6px",
                                            fontSize: 12,
                                            bgcolor: "rgba(255,255,255,0.8)",
                                        }}
                                        onClick={() =>
                                            setFiles(prev => prev.filter((_, i) => i !== index))
                                        }
                                    >
                                        ✕
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}


            {/* ---------- form section ---------- */}
            <Grid container spacing={3} >
                {/* manual tags */}
                <Grid size={{ xs: 12, md: 6 }} >
                    <Typography fontWeight={500} mb={1}>
                        Manual Tags
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Enter tag"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAddTag()}
                        />
                        <Button variant="contained" onClick={handleAddTag}>
                            Add
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        {manualTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={() =>
                                    setManualTags(prev => prev.filter(t => t !== tag))
                                }
                            />
                        ))}
                    </Stack>
                </Grid>

                {/* user tagging */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography fontWeight={500} mb={1}>
                        Tag Users
                    </Typography>
                    <Autocomplete
                        disablePortal fullWidth multiple
                        value={taggedUsers}
                        onChange={handleUserListOnChange}
                        options={users ?? []}
                        getOptionLabel={(option) => option.username}
                        renderOption={(props, option) => {
                            const { key, ...restprops } = props;
                            return (<li key={key} {...restprops}>
                                <Box sx={{
                                    width: "100%", px: 1.5, py: 1, borderRadius: 1,
                                    "&:hover": { bgcolor: "grey.100" },
                                }}
                                >
                                    <Typography fontSize={14} fontWeight={600}>
                                        {option.email}
                                    </Typography>
                                    <Typography fontSize={12} color="text.secondary">
                                        {option.username}
                                    </Typography>
                                </Box>
                            </li>
                            )
                        }
                        }
                        renderInput={(params) => <TextField {...params} fullWidth label='Tagged Users' placeholder='Add new Tagged Users...' />}
                    />

                </Grid>
            </Grid>

            {/* ---------- footer actions ---------- */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="flex-end"
                spacing={2}
                mt={5}
            >
                <Button
                    size="large"
                    variant="contained"
                    disabled={!files.length}
                    onClick={handleUpload}
                >
                    Upload {files.length ? `(${files.length})` : ""}
                </Button>
            </Stack>
        </Container>
    );
}
