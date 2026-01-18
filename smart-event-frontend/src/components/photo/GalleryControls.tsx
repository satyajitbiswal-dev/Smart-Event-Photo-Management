import { ExpandMore } from '@mui/icons-material';
import Search from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React from 'react'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
type props = {
    search: string | undefined,
    setSearch: React.Dispatch<React.SetStateAction<string | undefined>>,
    filter: string | undefined,
    setFilter: React.Dispatch<React.SetStateAction<string | undefined>>,
    layout: 'standard' | 'masonry',
    setLayout: React.Dispatch<React.SetStateAction<'standard' | 'masonry'>>,
}

const GalleryControls = ({ search, setSearch, filter, setFilter, layout, setLayout }: props) => {

    return (
        <Box
            sx={{
                display: { xs: 'none', md: 'block' },
                position: 'sticky',
                top: 135,
                height: 'fit-content',
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                boxShadow: 2,
            }}>
            {/* Layout Toggle - Top */}
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

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {/* Search */}
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search photos…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <Box display={'flex'} alignItems={'center'} gap={1}>
                    <TuneRoundedIcon color='info'/>
                    <Typography variant='subtitle2'>
                        Filters
                    </Typography>
                </Box>


                {/* 🎛 Filters */}
                <Stack spacing={1.5} direction={'column'} gap={1}>
                    <Button size="small" variant="outlined" endIcon={<ExpandMore />}>
                        Photographers
                    </Button>
                    <Button size="small" variant="outlined" endIcon={<ExpandMore />}>
                        Tags
                    </Button>
                    <Button size="small" variant="outlined" endIcon={<ExpandMore />}>
                        Date Range
                    </Button>
                </Stack>
            </Box>
        </Box>
    )
}

export default GalleryControls