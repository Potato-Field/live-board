import React, { useState, useRef, useEffect } from 'react';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import appid from './appId';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface AudioTracks {
    localAudioTrack: ILocalAudioTrack | null;
    remoteAudioTracks: { [uid: string]: IRemoteAudioTrack }; // 타입 수정
}

const VoiceChat: React.FC = () => {
    const [roomId] = useState<string>("main");
    const [micMuted, setMicMuted] = useState<boolean>(true);
    const [members, setMembers] = useState<Array<number>>([]); // 사용자 목록 상태 추가
    const rtcUid = Math.floor(Math.random() * 2032);
    const rtcClientRef = useRef<IAgoraRTCClient | null>(null);
    const [userVolumes, setUserVolumes] = useState<{ [uid: string]: number }>({});
    const audioTracksRef = useRef<AudioTracks>({
        localAudioTrack: null,
        remoteAudioTracks: {},
    });

    useEffect(() => {
        // initRtc();

        return () => {
            leaveRoom();
        };
    }, []);


    const initRtc = async () => {
        const token = null
        const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        rtcClientRef.current = rtcClient;
        rtcClient.on('user-joined', handleUserJoined);
        rtcClient.on('user-published', handleUserPublished);
        rtcClient.on('user-left', handleUserLeft);

        await rtcClient.join(appid, roomId, token, rtcUid);

        const localAudioTrack: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioTracksRef.current.localAudioTrack = localAudioTrack;

        localAudioTrack.setMuted(micMuted);
        await rtcClient.publish(localAudioTrack);


        console.log(rtcUid);

        setMembers([rtcUid]);
        // 볼륨 인디케이터 초기화
        initVolumeIndicator();

    };


    const initVolumeIndicator = () => {
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
    };

    const handleUserJoined = (user: any) => {
        console.log('USER:', user);
        // 새로 참여한 사용자의 UID를 members 상태에 추가합니다.
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

    return (
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            padding: 2,
                        }}
                    >
                        PHOTATO FIELD
                    </Typography>
                    <div id="room-header-controls">
                        <span id="members">
                            {members.map((uid) => (
                                <Box
                                    key={uid}
                                    className={`speaker user-rtc-${uid}`}
                                    sx={{
                                        display: 'inline-flex',
                                        borderRadius: '50%', // Ensures the Box is circular
                                        p: '2px', // Adjust padding to control the "border" thickness
                                        bgcolor: userVolumes[uid] >= 40 ? '#00ff00' : '#fff', // Background color of the Box acts as the border color
                                        border: '2px solid', // Optional: if you want an outer border as well
                                        borderColor: 'transparent' // Makes the outer border transparent; adjust as needed
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>{uid}</Avatar>
                                </Box>
                            ))}
                        </span>
                        <form id="joinForm" onSubmit={joinSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button
                                variant="outlined"
                                onClick={toggleMic}
                                style={{ backgroundColor: micMuted ? '#db5858' : 'ivory' }}
                                startIcon={micMuted ? <MicOffIcon /> : <MicIcon />}
                            >
                                {micMuted ? 'Unmute' : 'Mute'}
                            </Button>
                            <Button
                                variant="outlined"
                                type="submit"
                                onClick={joinSubmit} // Button 클릭 시 joinSubmit 함수 호출
                                style={{ backgroundColor: 'ivory' }}
                            >
                                Join
                            </Button>
                            <Button
                                style={{ backgroundColor: 'ivory' }}
                                onClick={leaveRoom}
                            >
                                <LogoutIcon />
                            </Button>
                        </form>
                    </div>
                </Toolbar>
    );
};

export default VoiceChat;