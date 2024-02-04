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
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button } from '@mui/material';
// import VoiceChat from "./voicechat/voicechat";

export default function NavBar() {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
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

          {/* 왼쪽 아이콘 박스 - 투표, 타이머 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" aria-label="Postit vote" color="inherit">
              <HowToVoteIcon />
            </IconButton>
            <IconButton size="large" aria-label="Stop watch" color="inherit">
              <TimerIcon />
            </IconButton>
          </Box>

          {/* 중간 빈 공간 */}
          <Box sx={{ flexGrow: 1 }} />

          {/* 오른쪽 - 아바타 & 초대 */}
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
              <GroupAddIcon />
            </IconButton>
          </Box>

          {/* 오른쪽 - 화면 작아졌을 때 */}
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

          {/* 오른쪽 -  */}
          <IconButton size="large" aria-label="Export" color="inherit">
              <FileDownloadIcon />
          </IconButton>

        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {/* {renderMenu} */}
    </Box>
  );
}