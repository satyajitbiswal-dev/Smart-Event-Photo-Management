import React from 'react'
import { AppBar, Box, Button, Container, Divider, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, setPersist } from '../../app/authslice';
import { LogoutOutlined } from '@mui/icons-material';
import ProfilePic from '../../features/auth/ProfilePic';
import type { RootState } from '../../app/store';
import Notification from '../buttons/Notification';

const pages = [{
  'name':'Home',
  'route':'/'
},
{
  'name':'Events',
  'route':'/events'
}
];

const privatepages = [{
  'name':'Favourites',
  'route':'favourites/'
},
{
  'name':'Tagged',
  'route':'/tagged/'
}
];

const Navbar = () => {
  const authuser = useSelector((state:RootState) => state.auth.user)
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const navigate = useNavigate()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const dispatch = useDispatch()
  const handleLogout = async () =>{
        dispatch(logout())
        dispatch(setPersist(false))
    }
  return (
    <AppBar position="sticky" elevation={1} sx={{maxHeight:64}}>
      <Container maxWidth="xl" >
        <Toolbar disableGutters>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              fontSize: 25,
              textDecoration: 'none',
            }}
          >
           Event Photos 
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={()=>{handleCloseNavMenu(); 
                  navigate(`${page.route}`)
                }}>
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                </MenuItem>
              ))}
              {(isAuthenticated || authUser?.role !=='P' ) && privatepages.map((page) => (
                <MenuItem key={page.name} onClick={()=>{handleCloseNavMenu(); 
                  navigate(`${page.route}`)
                }}>
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                </MenuItem>
              ))}
              
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Event Photos
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={()=>{handleCloseNavMenu(); navigate(`${page.route}`)}}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
            {(isAuthenticated || authUser?.role !=='P' ) && privatepages.map((page) => (
                <MenuItem key={page.name} onClick={()=>{handleCloseNavMenu(); 
                  navigate(`${page.route}`)
                }}>
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                </MenuItem>
              ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            { (isAuthenticated || authUser?.role !== 'P') && <Notification/>}
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <ProfilePic/>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              { (isAuthenticated || authUser?.role !== 'P') ?
                <MenuItem key="Profile" onClick={()=>{handleCloseUserMenu();
                navigate(`/profile/${authUser?.username}/`)}}>
                Profile
              </MenuItem> : <MenuItem key="Guset">
                Guestuser
              </MenuItem>
              }
             {authUser?.role === 'A' && <MenuItem key="Admin" onClick={()=>{handleCloseUserMenu();
                navigate('/admin')}} >
                Admin Panel
              </MenuItem>}
              { (isAuthenticated || authUser?.role !== 'P') && <MenuItem key={"Your Dashboard"} 
                onClick={()=>{handleCloseUserMenu(); 
                navigate('photographer/dashboard/')}}
            >Your Dashboard</MenuItem>
          }
          <Divider/>
              <MenuItem key="logout" onClick={()=>{
                handleCloseUserMenu()
                handleLogout()
                navigate('/signin')
              }}
               sx={{ color: 'error.main', fontWeight: 500 }}
               ><LogoutOutlined fontSize="small" sx={{ mr: 1 }} />
            Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar