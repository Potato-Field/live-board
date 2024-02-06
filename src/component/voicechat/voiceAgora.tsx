import React, { useState, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import appid from './appId';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import LogoutIcon from '@mui/icons-material/Logout';

interface Member {
    uid: number;
    nickname: string;
  }
interface AudioTracks {
    localAudioTrack: ILocalAudioTrack | null;
    remoteAudioTracks: { [uid: string]: IRemoteAudioTrack }; // 타입 수정
}

const VoiceAgora: React.FC = () => {
    const location = useLocation();
    const [roomId] = useState<string>("main");
    const [micMuted, setMicMuted] = useState<boolean>(true);
    const [members, setMembers] = useState<Array<Member>>([]);
    // const [members, setMembers] = useState<Array<number>>([]);
    const [userVolumes, setUserVolumes] = useState<{ [nickname: string]: number }>({});
    const rtcUid = Math.floor(Math.random() * 2032);
    const rtcClientRef = useRef<IAgoraRTCClient | null>(null);
    const navigate = useNavigate()
    const audioTracksRef = useRef<AudioTracks>({
        localAudioTrack: null,
        remoteAudioTracks: {},
    });
    

    const initRtc = async () => {
        const token = null
        const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        rtcClientRef.current = rtcClient;
        rtcClient.on('user-joined', handleUserJoined);
        rtcClient.on('user-published', handleUserPublished);
        rtcClient.on('user-left', handleUserLeft);

        await rtcClient.join(appid, roomId, token, rtcUid);
        const { nickname } = location.state || { nickname: '' };
        const member: Member = {uid: rtcUid, nickname};

        const localAudioTrack: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioTracksRef.current.localAudioTrack = localAudioTrack;

        localAudioTrack.setMuted(micMuted);
        await rtcClient.publish(localAudioTrack);
        

        console.log(rtcUid);

        setMembers(prevMembers => [...prevMembers, member]);        // 볼륨 인디케이터 초기화
        console.log(members);
        
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
        console.log("실행되니?");
        
    };


    const leaveRoom = async () => {
        const { localAudioTrack } = audioTracksRef.current;
        localAudioTrack?.stop();
        localAudioTrack?.close();

        await rtcClientRef.current?.unpublish();
        await rtcClientRef.current?.leave();

        navigate("/")
    };

    const handleUserJoined = (user: { uid: number; nickname: string; }) => {
        console.log('USER:', user);
        setMembers(prevMembers => {
          const isUserExist = prevMembers.some(member => member.uid === user.uid);
          if (!isUserExist) {
            // 사용자가 존재하지 않으면 추가합니다.
            return [...prevMembers, { uid: user.uid, nickname: user.nickname }];
          }
          return prevMembers;
        });
      };

    // const handleUserJoined = (user: any) => {
    //     console.log('USER:', user);
    //     setMembers(prevMembers => {
    //         // 새로운 사용자가 이미 목록에 있는지 확인합니다.
    //         const isUserExist = prevMembers.includes(user.uid);
    //         // 존재하지 않는 경우에만 목록에 추가합니다.
    //         return isUserExist ? prevMembers : [...prevMembers, user.uid];
    //     });
    // };

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

    const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        toggleMic();
        await joinSubmit(e as unknown as React.FormEvent); // joinSubmit은 FormEvent를 기대하지만, 여기서는 MouseEvent를 받으므로 타입 캐스팅이 필요합니다.
    };

    return (
            <div id="room-header-controls">
                <span id="members">
                    {members.map((member) => (
                        <span key={member.uid} className={`speaker user-rtc-${member.uid}`}>
                                <Box
                                    key={member.uid}
                                    className={`speaker user-rtc-${member.uid}`}
                                    sx={{
                                        display: 'inline-flex',
                                        borderRadius: '50%', // Ensures the Box is circular
                                        p: '2px', // Adjust padding to control the "border" thickness
                                        bgcolor: userVolumes[member.uid] >= 40 ? '#00ff00' : '#fff', // Background color of the Box acts as the border color
                                        border: '2px solid', // Optional: if you want an outer border as well
                                        borderColor: 'transparent' // Makes the outer border transparent; adjust as needed
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>{member.uid}</Avatar>
                                </Box>
                        </span>
                    ))}
                </span>
                <form id="joinForm" onSubmit={joinSubmit}>
                    <Button
                        onClick={handleButtonClick}
                        style={{ backgroundColor: micMuted ? 'indianred' : 'ivory' }}
                        startIcon={micMuted ? <MicOffIcon /> : <MicIcon />}
                    >
                        {micMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button
                                style={{ backgroundColor: 'primary' }}
                                onClick={leaveRoom}
                            >
                                <LogoutIcon />
                            </Button>
                </form>
            </div>
    );
};

export default VoiceAgora;