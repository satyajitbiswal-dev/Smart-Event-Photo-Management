import { Box, IconButton, ListItemIcon, ListItemText, MenuItem, Switch, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { toggleTheme } from '../../app/theme'
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material'
type props = {
    view: 'Mobile' | 'Desktop'
}

const ThemeToggle = ({ view }: props) => {
    const mode = useSelector((state: RootState) => state.theme.mode)
    const dispatch = useDispatch<AppDispatch>();
    const toggleThemeButton = () => {
        dispatch(toggleTheme());
    }
    if (view == 'Mobile') {
        return (
            <MenuItem disableRipple
                sx={{ py: 1.5,}}
                onClick={(e) => e.stopPropagation()} 
            >
                <ListItemIcon sx={{ minWidth: 30 }}>
                    {mode === 'dark' ? (<DarkModeOutlined fontSize="small" />) : 
                    (<LightModeOutlined fontSize="small" />)}
                </ListItemIcon>
                <ListItemText primary='Dark Mode'
                    slotProps={{primary:{
                        fontSize: 14,
                        fontWeight: 500,
                    }
                    }}
                />

                <Box sx={{ ml: 'auto' }}>
                    <Switch size="small"
                        checked={mode === 'dark'}
                        onChange={() => dispatch(toggleTheme())}
                    />
                </Box>
            </MenuItem>
        )
    }

    //Desktop icon
    return (
        <Tooltip title="Toggle theme">
            <IconButton onClick={toggleThemeButton} color="inherit" sx={{ mr: 1 }} >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
        </Tooltip>
    )
}

export default ThemeToggle
