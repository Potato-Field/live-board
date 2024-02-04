import React, { useState, useRef, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

// interface AudioTracks {
//     localAudioTrack: ILocalAudioTrack | null;
//     remoteAudioTracks: { [uid: string]: IRemoteAudioTrack }; // 타입 수정
// }


interface VolumeIndicator {
    nickname: string; // 'uid' 대신 'nickname' 사용
    level: number;
}
const socket = io("https://www.jungleweb.duckdns.org:1111");

const VoiceChat: React.FC = () => {
    
    const [members, setMembers] = useState<Array<string>>([]); // nickname만 저장
    const [userVolumes, setUserVolumes] = useState<{ [nickname: string]: number }>({});
    const rtcClientRef = useRef<any>(null);
    const location = useLocation();
    const { nickname, loggedIn } = location.state || { nickname: '', loggedIn: false };

    const [micMuted, setMicMuted] = useState<boolean>(true);
    const myAudio = useRef<HTMLAudioElement>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const navigate = useNavigate();


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            if (myAudio.current) {
                myAudio.current.srcObject = stream;
            }
            stream.getAudioTracks()[0].enabled = !micMuted;
        });

        
        socket.on("user-connected", handleUserConnected);
        socket.on("offer", handleReceiveOffer);
        socket.on("answer", handleReceiveAnswer);
        socket.on("ice-candidate", handleNewICECandidateMsg);
        if (nickname) {
            socket.emit("join-room", { nickname });
        }

        if (loggedIn && nickname) {
            setMembers(prevMembers => {
                // 동일한 nickname이 이미 members 배열에 없는 경우에만 추가
                if (!prevMembers.includes(nickname)) {
                    return [...prevMembers, nickname];
                }
                return prevMembers;
            });
            setUserVolumes(prevVolumes => ({ ...prevVolumes, [nickname]: 0 }));
        }

        socket.on("members-updated", (updatedMembers) => {
            setMembers(updatedMembers); // 서버로부터 받은 멤버 리스트로 상태 업데이트
        });

        // RTC 클라이언트 초기화 및 볼륨 인디케이터 설정
        initVolumeIndicator();
        

        return () => {
            socket.off("user-connected");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("members-updated");
            socket.close();

        };
    }, [nickname]); 


    const initVolumeIndicator = () => {
        if (!rtcClientRef.current) {
            console.warn("RTC Client is not initialized");
            return;
        }
    
        rtcClientRef.current.enableAudioVolumeIndicator();
        rtcClientRef.current.on("volume-indicator", (volumes: VolumeIndicator[]) => {
            const newVolumes = { ...userVolumes };
            volumes.forEach((volume: VolumeIndicator) => {
                newVolumes[volume.nickname] = volume.level; // 'uid' 대신 'nickname'을 키로 사용
            });
            setUserVolumes(newVolumes);
        });
    };

    const handleUserConnected = (data: { from: string, nickname: string }) => {
        createPeerConnection(data.from, socket.id === data.from);
    };

    const createPeerConnection = (socketId: string, initiator: boolean) => {
        console.log(nickname, loggedIn);

        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        peerConnections.current.set(socketId, peerConnection);

        if (initiator) {
            peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(socketId);
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: socketId,
                    candidate: event.candidate,
                });
            }
        };

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        });
    };

    const handleNegotiationNeededEvent = (socketId: string) => {
        const peerConnection = peerConnections.current.get(socketId);
        peerConnection?.createOffer().then(offer => {
            return peerConnection.setLocalDescription(offer);
        }).then(() => {
            socket.emit("offer", {
                to: socketId,
                offer: peerConnection?.localDescription
            });
        }).catch(console.log);
    };

    const handleReceiveOffer = (data: { from: string, offer: RTCSessionDescriptionInit }) => {
        createPeerConnection(data.from, false);
        const peerConnection = peerConnections.current.get(data.from);
        peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer)).then(() => {
            return peerConnection.createAnswer();
        }).then(answer => {
            return peerConnection.setLocalDescription(answer);
        }).then(() => {
            socket.emit("answer", {
                to: data.from,
                answer: peerConnection?.localDescription
            });
        }).catch(console.log);
    };

    const handleReceiveAnswer = (data: { from: string, answer: RTCSessionDescriptionInit }) => {
        const peerConnection = peerConnections.current.get(data.from);
        peerConnection?.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(console.log);
    };

    const handleNewICECandidateMsg = (data: { from: string, candidate: RTCIceCandidateInit }) => {
        const peerConnection = peerConnections.current.get(data.from);
        peerConnection?.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.log);
    };

    const toggleMic = () => {
        setMicMuted(prevMicMuted => !prevMicMuted);
        if (myAudio.current) {
            const stream = myAudio.current.srcObject as MediaStream;
            stream.getAudioTracks()[0].enabled = micMuted;
        }
    };

    const leaveRoom = () => {
        peerConnections.current.forEach(conn => {
            conn.close();
        });
        peerConnections.current.clear();
        socket.emit("leave-room"); // 서버에 방을 떠남을 알림

    
        // 로그인 상태를 업데이트하는 로직이 필요합니다.
        // 여기서는 navigate를 사용하여 /login 페이지로 리다이렉트합니다.
        navigate("/");
    };

    return (
        <div>
            {loggedIn && (
                <>
                    <span id="members">
                        {members.map((nickname) => (
                            <Box
                                key={nickname} // nickname을 key로 사용
                                className={`speaker user-rtc-${nickname}`}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    p: '2px',
                                    bgcolor: userVolumes[nickname] >= 40 ? '#00ff00' : '#fff',
                                    border: '2px solid',
                                    borderColor: 'transparent',
                                    width: 56,
                                    height: 56,
                                }}
                            >
                                <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                                    {/*
                                        {nickname[0].toUpperCase()} 
                                    */}
                                    {nickname[0]} {/* 첫 글자를 대문자로 표시 */}
                                </Avatar>
                            </Box>
                        ))}
                    </span>
                    <audio ref={myAudio} autoPlay playsInline />
                    <Button onClick={toggleMic}>
                        {micMuted ? <MicOffIcon /> : <MicIcon />}
                    </Button>
                    <Button onClick={leaveRoom}>
                        <LogoutIcon />
                    </Button>
                </>
            )}
        </div>
    );
};

export default VoiceChat;

// const initRtc = async () => {
//     const token = null
//     const rtcClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
//     rtcClientRef.current = rtcClient;
//     rtcClient.on('user-joined', handleUserJoined);
//     rtcClient.on('user-published', handleUserPublished);
//     rtcClient.on('user-left', handleUserLeft);

//     await rtcClient.join(appid, roomId, token, rtcUid);

//     const localAudioTrack: ILocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//     audioTracksRef.current.localAudioTrack = localAudioTrack;

//     localAudioTrack.setMuted(micMuted);
//     await rtcClient.publish(localAudioTrack);


//     console.log(rtcUid);

//     setMembers([rtcUid]);
//     // 볼륨 인디케이터 초기화
//     initVolumeIndicator();

// };


// const initVolumeIndicator = () => {
//     if (!rtcClientRef.current) {
//         console.warn("RTC Client is not initialized");
//         return;
//     }

//     rtcClientRef.current.enableAudioVolumeIndicator();
//     rtcClientRef.current.on("volume-indicator", volumes => {
//         const newVolumes = { ...userVolumes };
//         volumes.forEach((volume) => {
//             newVolumes[volume.uid] = volume.level;
//         });
//         setUserVolumes(newVolumes);
//     });
// };


// const joinSubmit = async (e: React.FormEvent) => {
//     e.preventDefault(); // 폼의 기본 제출 동작을 방지합니다.
//     await initRtc(); // RTC 초기화 함수를 비동기적으로 호출합니다.
// };


// const leaveRoom = async () => {
//     const { localAudioTrack } = audioTracksRef.current;
//     localAudioTrack?.stop();
//     localAudioTrack?.close();

//     await rtcClientRef.current?.unpublish();
//     await rtcClientRef.current?.leave();
// };

// const handleUserJoined = (user: any) => {
//     console.log('USER:', user);
//     // 새로 참여한 사용자의 UID를 members 상태에 추가합니다.
//     setMembers(prevMembers => {
//         // 새로운 사용자가 이미 목록에 있는지 확인합니다.
//         const isUserExist = prevMembers.includes(user.uid);
//         // 존재하지 않는 경우에만 목록에 추가합니다.
//         return isUserExist ? prevMembers : [...prevMembers, user.uid];
//     });
// };

// const handleUserPublished = async (user: any, mediaType: "audio" | "video") => {
//     const track = await rtcClientRef.current?.subscribe(user, mediaType);

//     if (mediaType === "audio" && track) {
//         const audioTrack = track as IRemoteAudioTrack; // 타입 단언을 IRemoteAudioTrack으로 변경
//         audioTracksRef.current.remoteAudioTracks[user.uid] = audioTrack;
//         audioTrack.play(); // IRemoteAudioTrack에는 play 메서드가 있습니다.
//     }
// };

// const handleUserLeft = (user: any) => {
//     setMembers((prevMembers) => prevMembers.filter((uid) => uid !== user.uid)); // 사용자가 나갈 때 목록에서 제거
// };

// const toggleMic = () => {
//     setMicMuted((prevMicMuted) => {
//         const newMicMuted = !prevMicMuted;
//         audioTracksRef.current.localAudioTrack?.setMuted(newMicMuted);
//         return newMicMuted;
//     });
// };

//     return (
//                 <Toolbar disableGutters>
//                     <Typography
//                         variant="h6"
//                         noWrap
//                         component="a"
//                         sx={{
//                             mr: 2,
//                             display: { xs: 'none', md: 'flex' },
//                             fontFamily: 'monospace',
//                             fontWeight: 700,
//                             letterSpacing: '.1rem',
//                             color: 'inherit',
//                             textDecoration: 'none',
//                             padding: 2,
//                         }}
//                     >
//                         PHOTATO FIELD
//                     </Typography>
//                     <div id="room-header-controls">
//                         <span id="members">
//                             {members.map((uid) => (
//                                 <Box
//                                     key={uid}
//                                     className={`speaker user-rtc-${uid}`}
//                                     sx={{
//                                         display: 'inline-flex',
//                                         borderRadius: '50%', // Ensures the Box is circular
//                                         p: '2px', // Adjust padding to control the "border" thickness
//                                         bgcolor: userVolumes[uid] >= 40 ? '#00ff00' : '#fff', // Background color of the Box acts as the border color
//                                         border: '2px solid', // Optional: if you want an outer border as well
//                                         borderColor: 'transparent' // Makes the outer border transparent; adjust as needed
//                                     }}
//                                 >
//                                     <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>{uid}</Avatar>
//                                 </Box>
//                             ))}
//                         </span>
//                         <form id="joinForm" onSubmit={joinSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             <Button
//                                 variant="outlined"
//                                 onClick={toggleMic}
//                                 style={{ backgroundColor: micMuted ? '#db5858' : 'ivory' }}
//                                 startIcon={micMuted ? <MicOffIcon /> : <MicIcon />}
//                             >
//                                 {micMuted ? 'Unmute' : 'Mute'}
//                             </Button>
//                             <Button
//                                 variant="outlined"
//                                 type="submit"
//                                 onClick={joinSubmit} // Button 클릭 시 joinSubmit 함수 호출
//                                 style={{ backgroundColor: 'ivory' }}
//                             >
//                                 Join
//                             </Button>
//                             <Button
//                                 style={{ backgroundColor: 'ivory' }}
//                                 onClick={leaveRoom}
//                             >
//                                 <LogoutIcon />
//                             </Button>
//                         </form>
//                     </div>
//                 </Toolbar>
//     );
// };

// export default VoiceChat;