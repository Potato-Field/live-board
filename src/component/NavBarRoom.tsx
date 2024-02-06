import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import TimerIcon from '@mui/icons-material/Timer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button } from '@mui/material';
import { VoteDrawer } from './VoteDrawer';
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
      {/* TODO: 참가자 목록 - 아바타 or 닉네임 넣기 -> 컴포넌트 사용 */}
      {/* TODO: MenuItem style css로 분리 */}
      <MenuItem id='nicknameMe' style={{display:'flex', justifyContent:'center'}} >
        참가자 1
        <p style={{opacity: '0.7', margin: '0', marginLeft: 'px'}}>(you)</p>
      </MenuItem>
      <MenuItem className='nicknameMem' style={{display:'flex', justifyContent:'center'}} >
        참가자 2
      </MenuItem>
      <MenuItem className='nicknameMem' style={{display:'flex', justifyContent:'center'}} >
        참가자 3
      </MenuItem>
      {/* 초대 TODO: 클릭시 방번호 popover 뜨도록 */}
      <MenuItem style={{display:'flex', justifyContent:'center'}} >
        <IconButton
          size="large"
          aria-label="Invite new user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          style={{padding: 0}}
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
            // TODO: 클릭시 '나가시겠습니까?' Dialog 뜨도록
            >
            <ArrowBackIosIcon fontSize='large' />
          </IconButton>

          <VoteDrawer />

          <IconButton size="large" aria-label="Stop watch" color="inherit">
            <TimerIcon fontSize='large' />
          </IconButton>

          {/* 중간 빈 공간 */}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { md: 'flex' } }}>
            <Button
              size="large"
              color="inherit"
              // TODO: onClick: 음소거
            >
              음소거 버튼
            </Button>
          </Box>

          {/* TODO: 이 공간에 멤버 아바타 추가되도록 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            Member avatar area
          </Box>

           <Box sx={{ display: { xs: 'none', md: 'flex' } }}>

            <IconButton
              size="large"
              aria-label="Invite new user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <PersonAddIcon fontSize='large' />
              {/* TODO: 클릭시 방번호 popover 뜨도록 */}
            </IconButton>
          </Box>

          {/* 화면 작아졌을 때 음소거버튼/아바타공간/초대버튼 사라지고 이 Box가 나타남 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="Member list"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <PeopleAltIcon fontSize='large' />
            </IconButton>
          </Box>

          <IconButton size="large" aria-label="Export" color="inherit">
              <FileDownloadIcon fontSize='large' />
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
  );
}