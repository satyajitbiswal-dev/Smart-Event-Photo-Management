import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    AvatarGroup,
    Box,
    Divider,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import PhotoEXIFData from "./EXIFData";
import type { Photo, PhotoEXIF } from "../../types/types";
import type { Event } from "../../types/types";
import type { User } from "../../types/types";

type Props = {
    photo: Photo;
    selectedEvent?: Event;
    taggedUsers: User[];
    photographer : string;
};

const PhotoINFO = ({ photo, taggedUsers, selectedEvent, photographer }: Props) => {
    const navigate = useNavigate()
    const photoEventDetails = {
        Event: selectedEvent?.event_name,
        Date: selectedEvent?.event_date
    }

    const hasAnyEXIFData = (exif?: PhotoEXIF) => {
        if (!exif) return false;
        return Object.values(exif).some(x => x !== null && x !== '' && x !== undefined)
    }
    return (
        <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5} textAlign={'center'}>
                <Typography variant="subtitle1" color="text.primary"> Photographer:</Typography>
                <Link to={`/profile/${photographer}`} style={{ textDecoration: 'None' }}> {photographer} </Link>
            </Stack>
            <Divider />
            {Object.entries(photoEventDetails).map(([label, value]) =>
                value ? (
                    <Box key={label}>
                        <Stack direction="row" spacing={1} alignItems="center" my={0.5}>
                            <Typography variant="body2" color="text.secondary"> {label}:</Typography>
                            <Typography variant="body2"> {value} </Typography>
                        </Stack>
                        <Divider />
                    </Box>
                ) : null
            )}
            <Stack direction="row" spacing={1} alignItems="center" my={1} textAlign={'center'}>
                <Typography sx={{ fontWeight: 600 }}>Tags:</Typography>
                {
                    photo?.tag && photo?.tag.length > 0 ?
                        photo.tag.map((e) => (
                            <Typography key={e} color='primary' onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(e)}&tbm=isch`, '_blank')} sx={{
                                backgroundColor: 'rgb(239, 239, 239)',
                                borderRadius: 0.5,
                                mr: 0.5, px: 0.5,
                                '&:hover': {
                                    cursor: 'pointer'
                                }
                            }}
                            > #{e} </Typography>
                        )) : <Typography>No Tags Available</Typography>
                }
            </Stack>
            {/* INFO page and People Tagged Accordion */}
            <Accordion defaultExpanded >
                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" expandIcon={<ExpandMore />} >
                    <Typography component="span" color='inherit'>INFO</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    {
                        hasAnyEXIFData(photo?.exifData) ? <PhotoEXIFData exif={photo?.exifData} /> :
                            <Typography variant='subtitle2' color='text.secondary'> No EXIF Data exists for this Photo </Typography>
                    }
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded >
                <AccordionSummary aria-controls="panel2d-content" id="panel2d-header" expandIcon={<ExpandMore />}>
                    <Typography component="span">People Tagged</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <AvatarGroup>
                        {photo?.tagged_user && photo?.tagged_user.length > 0 ?
                            taggedUsers.map((user) => (
                                <Tooltip key={user.username} title={user.username}>
                                    <Avatar alt={user.username} src={user.profile_pic}
                                        sx={{
                                            transition: '0.20s',
                                            '&:hover': {
                                                cursor: 'pointer',
                                                transform: "translateY(-1px)",
                                            }
                                        }}
                                        onClick={() => navigate(`/profile/${user.username}`)}
                                    />
                                </Tooltip>

                            )) : <Typography>No one Tagged</Typography>
                        }
                    </AvatarGroup>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}

export default PhotoINFO
