import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import "./index.css"
import { styled, useTheme } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';

import imageSampleMain from './image/imageSampleMain.png';
import imageSample4 from './image/imageSample4.png'
import imageSample5 from './image/imageSample5.png'
import imageSample6 from './image/imageSample6.png'
import imageSample7 from './image/imageSample7.png'
import imageSample8 from './image/imageSample8.png'
import imageSample9 from './image/imageSample9.png'
import addButton from './image/addbutton.png'
import { Button, ButtonBase } from '@mui/material';

import logo from './assets/liveBoardLogo.png';
import Copyright from './component/Copyright';
// import { ThemeConsumer } from 'styled-components';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

// 로비 Drawer 수정
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Lobby = () => {

    // const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { nickname } = location.state;
    // 서버요청해서 user목록 불러와야함. 
    // const [users, setUsers] = useState<User[]>([]);

    const [open, setOpen] = React.useState(false);
    // const [loggedIn, setLoggedIn] = useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleEnter = (e: any) => {
        e.preventDefault();
        navigate('/app', { state: { nickname: nickname } })
    }

    const handleLogOut = () => {
        navigate('/', { state: { nickname: '' } })
    }

    const theme = useTheme();


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '36px',
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <img src={logo} alt='Logo' style={{
                        maxHeight: '30px',
                    }}/>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button onClick={handleLogOut} sx={{
                        bgcolor: theme.palette.info.main,
                        color: 'white',
                        borderRadius: '30px',
                        fontWeight: 'bolder',
                        
                    }}>
                        로그아웃
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    <ListItemButton>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Personal Project" />
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemIcon>
                            <GroupsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Team Project" />
                    </ListItemButton>
                    {/* <Divider sx={{ my: 1 }} /> */}
                    {/* <ListItemButton onClick={handleLogOut}>
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Log Out" />
                    </ListItemButton> */}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    bgcolor: 'whitesmoke',
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mb: 4 }}>
                    <DrawerHeader />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5, padding: 1 }}>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase onClick={handleEnter}>
                                <CardMedia
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSampleMain}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Team2 PotatoField
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample4}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Drawing prac
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample5}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Insert image
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    // 여기 방 썸네일 불러와야함
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample6}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    PostIt
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center', padding: 1 }}>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    // 여기 방 썸네일 불러와야함
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample7}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Mind Map
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample8}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Server Flow
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250 }}>
                            <ButtonBase >
                                <CardMedia
                                    // 여기 방 썸네일 불러와야함
                                    sx={{
                                        height: 200,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={imageSample9}
                                    alt="Team2 PotatoField"
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Make Image
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ maxWidth: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 'none', alignItems: 'center' }}>
                            <ButtonBase
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    height: 200, // Set a specific height for the ButtonBase
                                    width: 300,
                                    '&:focus-visible': {  // This will remove the focus highlight/outline
                                        outline: 'none'
                                    }
                                }}
                            >
                                <CardMedia
                                    sx={{
                                        height: 100,
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    component="img"
                                    image={addButton}
                                />
                            </ButtonBase>
                            <CardContent>
                                <Typography fontSize={20} component="div">
                                    New Project
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Container>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Box>
        </Box>
    );
}

export default Lobby;