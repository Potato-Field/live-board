import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TimerIcon from '@mui/icons-material/Timer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button } from '@mui/material';
// import VoiceChat from "./voicechat/voicechat";

export default function NavBar() {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {/* 참가자 목록 */}
      <MenuItem>
        참가자 1
      </MenuItem>
      <MenuItem>
        참가자 2
      </MenuItem>
      {/* 초대 - menuitem 클릭하면 popover 뜨도록 */}
      <MenuItem >
        <IconButton
          size="large"
          aria-label="Invite new user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AddCircleIcon />
        </IconButton>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="Exit room"
            // 클릭시 '나가시겠습니까?' 알림 뜨도록
            >
            <ArrowBackIosIcon />
          </IconButton>

          <IconButton size="large" aria-label="Postit vote" color="inherit">
            <HowToVoteIcon />
          </IconButton>
          <IconButton size="large" aria-label="Stop watch" color="inherit">
            <TimerIcon />
          </IconButton>

          {/* 중간 빈 공간 */}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              size="large"
              color="inherit"
            >
              아바타 공간
            </Button>

            <IconButton
              size="large"
              aria-label="Invite new user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <PersonAddIcon />
            </IconButton>
          </Box>

          {/* 화면 작아졌을 때 바로 위의 Box 사라지고 이 Box가 나타남 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="Member list"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <PeopleAltIcon />
            </IconButton>
          </Box>

          <IconButton size="large" aria-label="Export" color="inherit">
              <FileDownloadIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
  );
}