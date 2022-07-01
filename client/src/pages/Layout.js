import { AppBar, Avatar, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import PetsIcon from '@mui/icons-material/Pets'
import PersonIcon from '@mui/icons-material/Person'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import React, { useState } from 'react'
import classes from '../css/Layout.module.css'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/system'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Alert from '../components/Alert';
import EmojiNatureOutlinedIcon from '@mui/icons-material/EmojiNatureOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useAppContext } from '../context/appContext'
import useWindowDimensions from '../utils/useWindowDimensions'

function getInitials(name) {
    let initials = ''
    initials = name.split(' ').map(str => str[0].toUpperCase()).join('')
    return initials
}

const smallScreenWidth = 1350

function Layout() {
    const screenDimensions = useWindowDimensions()
    // console.log(screenDimensions)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const navigate = useNavigate()
    const contextValues = useAppContext()
    const theme = useTheme()
    const location = useLocation()
    const list = [      //use context api in the actual project
        {
            key: 'all',
            text: 'Explore',
            icon: <SearchIcon />,
            link: '/all'
        },
        {
            key: 'register-pet',
            text: 'Register a Pet',
            icon: <AddIcon />,
            link: '/pets/register'
        },
        {
            key: 'register-shelter',
            text: 'Register a Shelter',
            icon: <AddIcon />,
            link: '/shelters/register'
        },
        {
            key: 'user-profile',
            text: 'My Profile',
            icon: <PersonIcon />,
            link: '/my-profile'
        },
        'divider',
        {
            key: 'contact',
            text: 'Contact Us',
            link: '/all'
        },
        {
            key: 'about',
            text: 'About',
            link: '/all'
        }
    ]

    function handleProfileClick(event) {
        setAnchorEl(event.currentTarget)
    }
    function closeMenu() {
        setAnchorEl(null)
    }

    return (
        <div className={classes.div}>
            <Alert />
            <AppBar position='fixed'
                sx={{
                    width: screenDimensions.width > smallScreenWidth ? drawerOpen ? 'calc(100% - 250px)' : '100%' : '100%',
                    transition: theme.transitions.create(["margin", "width"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen
                    })
                }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {
                            !drawerOpen &&
                            <IconButton onClick={() => { setDrawerOpen(true) }} color="inherit">
                                <MenuIcon />
                            </IconButton>
                        }
                        <PetsIcon sx={{ ml: 5 }} />
                        <Typography variant='h5' component='h1' sx={{ pl: 2 }}>
                            Pets
                        </Typography>
                    </Box>
                    {location.pathname === '/all' && <Tabs
                        TabIndicatorProps={{ style: { background: 'white' } }}
                        textColor="inherit"
                        aria-label="data-tabs"
                        value={contextValues.dataToDisplay}
                    >
                        <Tab icon={<EmojiNatureOutlinedIcon />} label="Pets" onClick={() => contextValues.changeDataToDisplay(0)} />
                        <Tab icon={<HomeOutlinedIcon />} label="Shelters" onClick={() => contextValues.changeDataToDisplay(1)} />
                        <Tab icon={<MapOutlinedIcon />} label="Map" onClick={() => contextValues.changeDataToDisplay(2)} />
                    </Tabs>}
                    {contextValues.user ? <IconButton onClick={handleProfileClick}>
                        <Avatar src={contextValues.user.profilePhoto}>{!contextValues.user.profilePhoto && getInitials(contextValues.user.name)}</Avatar>
                    </IconButton>
                        :
                        <Tabs textColor='inherit' value={0}>
                            <Tab icon={<PersonIcon />} label='Login' onClick={() => navigate('/signin')} />
                        </Tabs>
                    }
                    <Menu onClose={closeMenu} anchorEl={anchorEl} open={Boolean(anchorEl)} PaperProps={{
                        elevation: 0
                    }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    > {/*https://mui.com/material-ui/react-menu/ */}
                        <MenuItem onClick={() => {
                            closeMenu()
                            navigate('/my-profile')
                        }}>My Profile</MenuItem>
                        <MenuItem onClick={() => {
                            closeMenu()
                            contextValues.logout()
                        }}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Drawer open={drawerOpen} variant={screenDimensions.width > smallScreenWidth ? "persistent" : "temporary"} sx={{
                width: 250,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: '250px',
                    boxSizing: "border-box"
                }
            }} anchor='left'>
                <div className={classes['drawer-header']}>
                    <IconButton onClick={() => { setDrawerOpen(false) }}>
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />
                <List>  {/* make a new list for buttons like about and contact us to have proper padding between dividers */}
                    {list.map((item) => {
                        if (typeof (item) !== 'string') {
                            return <ListItem button key={item.key} onClick={() => { navigate(item.link) }}>
                                {
                                    item.icon &&
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                }
                                <ListItemText primary={item.text} />
                            </ListItem>
                        }
                        return <Divider key='divider' />
                    })}
                </List>
            </Drawer>
            <Box sx={{
                flexGrow: 1,
                padding: theme.spacing(3),
                paddingTop: 12,
                marginLeft: screenDimensions.width > smallScreenWidth ? drawerOpen ? '0' : '-250px' : '0',
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}>
                <Outlet />
            </Box>
        </div >
    )
}

export default Layout