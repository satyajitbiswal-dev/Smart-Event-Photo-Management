import Search from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { emptyFilters, fetchGalleryPhotos, resetGalleryFilters, setGalleryFilters, type GalleryFilters } from '../../app/photoslice';
import { useEffect, useState } from 'react';


type Props = | {
    context: 'event';
    event_id: string;   // REQUIRED
    layout: 'standard' | 'masonry';
    setLayout: (v: 'standard' | 'masonry') => void;
    onClose?: () => void
    variant: 'sidebar' | 'drawer'
}
    | {
        context: 'favourites' | 'tagged';
        event_id?: never;   // NOT allowed
        layout: 'standard' | 'masonry';
        setLayout: (v: 'standard' | 'masonry') => void;
        onClose?: () => void
        variant: 'sidebar' | 'drawer'
    };


const GalleryControls = ({ context, event_id, layout, setLayout, onClose, variant }: Props) => {

    const dispatch = useDispatch<AppDispatch>();

    const filters = useSelector((state: RootState) => {
        if (context === 'event') {
            return state.photo.filters.event[event_id] ?? emptyFilters
        }
        return state.photo.filters[context]
    }
    )
    const [draftFilters, setDraftFilters] = useState<GalleryFilters>(filters);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftFilters(filters);
    }, [filters, context, event_id]);

    // const updateFilters = (patchFilter: Partial<GalleryFilters>) => {
    //     dispatch(setGalleryFilters({
    //         context, event_id, filters: patchFilter
    //     }))
    // }

    useEffect(() => {
        //filters change → fresh fetch
        dispatch(fetchGalleryPhotos({ context, event_id }));
    }, [dispatch,
        context,
        event_id,
        filters.search,
        filters.photographer,
        filters.date_range,
        filters.startDate,
        filters.endDate,
        filters.tags.join(','),
        filters.tagged_users.join(','),
    ]);


    return (
        <Box sx={{
            position: variant === 'sidebar' ? 'sticky' : 'relative',
            top: variant === 'sidebar' ? 120 : 0,
            maxHeight: variant === 'drawer' ? '100vh' : 'calc(100vh - 150px)',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
        }}>
            <Stack spacing={2}>
                {/* Layout Toggle - Top */}
                <Stack spacing={1.5}>
                    <ToggleButtonGroup
                        value={layout}
                        exclusive
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                        onChange={(_, value) => value && setLayout(value)}
                    >
                        <ToggleButton value="masonry">Masonry</ToggleButton>
                        <ToggleButton value="standard">Grid</ToggleButton>
                        {/* <ToggleButton value="timeline">Timeline</ToggleButton> */}
                    </ToggleButtonGroup>

                    {/* Search */}
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search photos…"
                        value={draftFilters.search}
                        onChange={(e) =>
                            setDraftFilters(prev => ({ ...prev, search: e.target.value }))
                        }
                        slotProps={{
                            input: {
                                startAdornment: (<InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Stack>
                {/* Filters */}
                <Stack spacing={1.5} direction={'column'} gap={1}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                            <TuneRoundedIcon color="info" />
                            <Typography variant="subtitle2">
                                Filters
                            </Typography>
                        </Box>

                        <Button size="small" color="error"
                            onClick={() =>
                                dispatch(resetGalleryFilters({ context, event_id }))
                            }
                        >
                            Clear
                        </Button>
                    </Box>

                    <TextField
                        size="small"
                        label="Photographer"
                        placeholder="Type name…"
                        value={draftFilters.photographer ?? ''}
                        onChange={(e) =>
                            setDraftFilters(prev => ({ ...prev, photographer: e.target.value }))
                        }
                    />

                    <Box>
                        <TextField
                            size="small"
                            label="Tags"
                            placeholder="Enter tag and press Enter"
                            value={draftFilters.tags.join(', ')}
                            onChange={(e) =>
                                setDraftFilters(f => ({
                                    ...f,
                                    tags: e.target.value
                                        .split(',')
                                        .map(t => t.trim())
                                        .filter(Boolean),
                                }))
                            }
                        />

                    </Box>

                    <TextField
                        size="small"
                        label="Tagged User"
                        placeholder="username"
                        value={draftFilters.tagged_users[0] ?? ''}
                        onChange={(e) =>
                            setDraftFilters(prev => ({ ...prev, tagged_users: e.target.value ? [e.target.value] : [] }))
                        }
                    />

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Date Range
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{overflowX: 'scroll'}}>
                            {([
                                { key: 'today', label: 'Today' },
                                { key: 'this_week', label: 'This Week' },
                                { key: 'last_week', label: 'Last Week' },
                                { key: 'this_month', label: 'This Month' },
                            ] as const //Otherwise date_range's key will be string
                            ).map(({ key, label }) => (
                                <Button key={key} size="small" 
                                    variant={draftFilters.date_range === key ? 'contained' : 'outlined'}
                                    onClick={() =>
                                        setDraftFilters(prev => ({ ...prev, date_range: key, startDate: undefined, endDate: undefined }))
                                    }
                                >
                                    {label}
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Button variant="contained"  size='small'
                        onClick={() => {
                            dispatch(setGalleryFilters({
                                context,
                                event_id,
                                filters: draftFilters,
                            }));
                        }}
                    >
                        Apply Filters
                    </Button>
                    {variant === 'drawer' && (
                        <Button variant="outlined" size='small' onClick={onClose}>
                            Close
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    )
}

export default GalleryControls