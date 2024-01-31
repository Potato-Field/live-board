import React, { useState, useRef, useEffect } from 'react';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import appid from './appId';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';

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
        // if (rtcClientRef.current) {
        //     rtcClientRef.current.enableAudioVolumeIndicator();
        //     rtcClientRef.current.on("volume-indicator", (volumes) => {
        //         volumes.forEach((volume) => {
        //             const items = document.getElementsByClassName(`user-rtc-${volume.uid}`);
        //             if (items.length > 0) {
        //                 const item = items[0] as HTMLElement;
        //                 item.style.borderColor = volume.level >= 50 ? '#00ff00' : "#fff";
        //             }
        //         });
        //     });
        // }
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
        <div id='container'>
            <div id="room-header-controls">
                <span id="members">
                    {members.map((uid) => (
                        <span key={uid} className={`speaker user-rtc-${uid}`}>
                            <Avatar sx={{ bgcolor: deepOrange[500] }}>{uid}</Avatar>
                        </span>
                    ))}
                </span>
                <form id="joinForm" onSubmit={joinSubmit}>
                    <Button
                        onClick={toggleMic}
                        style={{ backgroundColor: micMuted ? 'indianred' : 'ivory' }}
                        startIcon={micMuted ? <MicOffIcon /> : <MicIcon />}
                    >
                        {micMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button
                        onClick={leaveRoom}
                    >
                        <LogoutIcon fontSize='large' />
                    </Button>
                    <Button
                        type="submit"
                        onClick={joinSubmit} // Button 클릭 시 joinSubmit 함수 호출
                    // ...기타 스타일과 속성...
                    >
                        Join
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default VoiceChat;