import * as React from 'react';
import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import appid from './voicechat/appId';

import Konva from 'konva';

import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Toolbar, IconButton, MenuItem, Menu, Tooltip } from '@mui/material';
import { AddCircle, PeopleAlt, PersonAdd,FileDownload, ArrowBackIos, Mic, MicOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { VoteDrawer } from './VoteDrawer';

interface AudioTracks {
  localAudioTrack: ILocalAudioTrack | null;
  remoteAudioTracks: { [uid: string]: IRemoteAudioTrack }; // 타입 수정
}

export const NavBarRoom = ( {stageRef}: {stageRef:React.RefObject<Konva.Stage>} ) => {
  const theme = useTheme();

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);  // Dialog

  ///////////////////// VoiceAgora /////////////////////
  const location = useLocation();
  const {nickname} = location.state;
  const [roomId] = useState<string>("main");
  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [members, setMembers] = useState<Array<string>>([]);
  const [userVolumes, setUserVolumes] = useState<{ [nickname: string]: number }>({});
  const rtcUid = nickname;
  const rtcClientRef = useRef<IAgoraRTCClient | null>(null);
  const navigate = useNavigate()
  const audioTracksRef = useRef<AudioTracks>({
      localAudioTrack: null,
      remoteAudioTracks: {},
  });


  const initRtc = async () => {
    const token = null
    // 클라이언트 유저 생성
    const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    // 본인 설정
    rtcClientRef.current = rtcClient;
    // Agora RTC 서버에 join, publish, left 통신보내기
    rtcClient.on('user-joined', handleUserJoined);
    rtcClient.on('user-published', handleUserPublished);
    rtcClient.on('user-left', handleUserLeft);

    // join 대기
    await rtcClient.join(appid, roomId, token, rtcUid);
    
    // 마이크, 오디오 트랙 생성
    const localAudioTrack: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // 본인 마이크, 오디오로 설정
    audioTracksRef.current.localAudioTrack = localAudioTrack;

    localAudioTrack.setMuted(micMuted);
    // 오디오 트랙에 publish 
    await rtcClient.publish(localAudioTrack);

    setMembers([rtcUid]);        
    // 볼륨 인디케이터 초기화
    initVolumeIndicator();
  };


  const initVolumeIndicator = async () => {
    if (!rtcClientRef.current) {
      console.warn("RTC Client is not initialized");
      return;
    }

    rtcClientRef.current.enableAudioVolumeIndicator();
    rtcClientRef.current.on("volume-indicator", volumes => {
      const newVolumes = { ...userVolumes };
      volumes.forEach((volume) => {
        newVolumes[volume.uid] = volume.level;
      });
      setUserVolumes(newVolumes);
    });
  };


  const joinSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작을 방지합니다.
    await initRtc(); // RTC 초기화 함수를 비동기적으로 호출합니다.
  };


  const leaveRoom = async () => {
    const { localAudioTrack } = audioTracksRef.current;
    localAudioTrack?.stop();
    localAudioTrack?.close();

    await rtcClientRef.current?.unpublish();
    await rtcClientRef.current?.leave();

    navigate("/lobby", { state: { nickname: nickname} })
  };


  const handleUserJoined = (user: { uid: string; nickname: string; }) => {
    setMembers(prevMembers => {
      // 새로운 사용자가 이미 목록에 있는지 확인합니다.
      const isUserExist = prevMembers.includes(user.uid);
      // 존재하지 않는 경우에만 목록에 추가합니다.
      return isUserExist ? prevMembers : [...prevMembers, user.uid];
    });
  };


  const handleUserPublished = async (user: any, mediaType: "audio" | "video") => {
    const track = await rtcClientRef.current?.subscribe(user, mediaType);

    if (mediaType === "audio" && track) {
      const audioTrack = track as IRemoteAudioTrack; // 타입 단언을 IRemoteAudioTrack으로 변경
      audioTracksRef.current.remoteAudioTracks[user.uid] = audioTrack;
      audioTrack.play(); // IRemoteAudioTrack에는 play 메서드가 있습니다.
    }
  };


  const handleUserLeft = (user: any) => {
    setMembers((prevMembers) => prevMembers.filter((uid) => uid !== user.uid)); // 사용자가 나갈 때 목록에서 제거
  };


  const toggleMic = () => {
    setMicMuted((prevMicMuted) => {
        const newMicMuted = !prevMicMuted;
        audioTracksRef.current.localAudioTrack?.setMuted(newMicMuted);
        return newMicMuted;
    });
  };
  ///////////////////////////////////////////////////////

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
      {members.map((uid) => (
        <MenuItem
          className={`speaker user-rtc-${uid}`} 
          style={{display:'flex', justifyContent:'center'}}
          sx={{
            bgcolor: userVolumes[uid] >= 40 ? theme.palette.primary.main : '#ffffff'
          }} >
          {uid}
        </MenuItem>
      ))}

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
          <AddCircle />
        </IconButton>
      </MenuItem>
    </Menu>
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }} position="relative">
      <AppBar position="absolute" style={{zIndex: "999", display: 'flex', justifyContent: 'center', height: '55px'}}>
        <Toolbar>
          <Tooltip arrow placement="bottom" title="나가기">
            <IconButton
              edge="start"
              aria-label="Exit room"
              onClick={handleClickOpen}
              >
              <ArrowBackIos />
            </IconButton>
          </Tooltip>

          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"🧐"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                이 방에서 나가시겠습니까?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={leaveRoom} style={{backgroundColor: theme.palette.info.main, color: 'white'}} >YES</Button>
              <Button onClick={handleClose} autoFocus style={{backgroundColor: '#636567', color: 'white'}}>NO</Button>
            </DialogActions>
          </Dialog>

          <VoteDrawer stageRef = {stageRef}/>

          {/* <IconButton size="large" aria-label="Stop watch" color="inherit">
            <TimerIcon fontSize='large' />
          </IconButton> */}

          {/* 중간 빈 공간 */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* TODO: Join 버튼 누르지 않아도 방에 들어오면 joinSubmit 되도록 */}
          <Button
              style={{ backgroundColor: theme.palette.secondary.main, color: '#636567', borderRadius: '30px', fontWeight: '700' }}
              onClick={joinSubmit}
              >
              JOIN
          </Button>

          <IconButton onClick={toggleMic} size='large'>
            {micMuted ? <MicOff style={{color: "indianred"}} fontSize='large' /> : <Mic style={{color: "green"}} fontSize='large' />}
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <span id="members" style={{display: 'flex', alignItems: 'center'}}>
              {members.map((uid) => (
                <span key={uid} className={`speaker user-rtc-${uid}`}>
                  <Box
                    key={uid}
                    className={`speaker user-rtc-${uid}`}
                    sx={{
                      display: 'inline-flex',
                      borderRadius: '50%', // Ensures the Box is circular
                      p: '2px', // Adjust padding to control the "border" thickness
                      bgcolor: userVolumes[uid] >= 40 ? '#00ff00' : '#fff', // Background color of the Box acts as the border color
                      border: '1px solid', // Optional: if you want an outer border as well                    
                      borderColor: 'transparent' // Makes the outer border transparent; adjust as needed
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.info.main, width: 45, height: 45, fontSize: 15 }}>{uid}</Avatar>
                  </Box>
                </span>
              ))}
            </span>

            <Tooltip arrow placement="bottom" title="초대">
              <IconButton
                size="large"
                aria-label="Invite new user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                // color="inherit"
                >
                {/* <PersonAdd fontSize='large' /> */}
                <AddCircle fontSize='large' />
                {/* TODO: 클릭시 방번호 popover 뜨도록 */}
              </IconButton>
            </Tooltip>
          </Box>

          {/* 화면 작아졌을 때 아바타공간/초대버튼 사라지고 이 Box가 나타남 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="Member list"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              // color="inherit"
              >
              <PeopleAlt fontSize='large' />
            </IconButton>
          </Box>

          <Tooltip arrow placement="bottom" title="저장">
            <IconButton
              size="large" 
              aria-label="Export" 
              // color="inherit"
              >
                <FileDownload fontSize='large' />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </Box>
  );
}

export default NavBarRoom;