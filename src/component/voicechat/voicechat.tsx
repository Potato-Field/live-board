import React, { useState, useRef, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Socket, io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';


const Server = process.env.NODE_ENV === 'production'
    ? 'https://www.jungleweb.duckdns.org:1111/'
    : 'http://localhost:1111/';

let socket: Socket | undefined;


const VoiceChat: React.FC = () => {

    const location = useLocation();


    const [room, setRoom] = useState<string>("defaultRoom");


    const myAudio = useRef<HTMLAudioElement>(null);
    const peerAudio = useRef<any>(null);
    // location.state || { nickname: ''};
    const [users, setUsers] = useState<Array<string>>([]);
    const [myMuted, setMyMuted] = useState<boolean>(false);
    const [myStream, setMyStream] = useState<MediaStream | null>();
    const navigate = useNavigate();


    useEffect(() => {
        socket = io(Server);
        const { nickname } = location.state || { nickname: '' };


        console.log(nickname);
        if (nickname && room) {
            // 'join' 이벤트를 서버로 emit

            socket.emit('join', { nickname: nickname, room: room }),
                (error: any) => {
                    if (error) {
                        alert(error);
                        navigate('/');
                    }
                };
        }
        console.log("join메세지를 보냄");

    }, [location.state, navigate]);


    //room data 전송
    useEffect(() => {
        // 'roomData' 이벤트를 수신하여 방 정보와 사용자 목록 업데이트
        socket?.on('roomData', ({ room, users }) => {
            setRoom(room);
            setUsers(users);
            console.log(users);
            console.log("roomdata 메세지받음");
        });

        console.log(users);
    }, []);

    // media setup
    useEffect(() => {
        let stream: MediaStream | null = null;
        let peerConnection: RTCPeerConnection = new RTCPeerConnection();

        peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                    ],
                },
            ],
        });
        const startMedia = async () => {
            const getMedia = async () => {
                const contraints = {
                    audio: {
                        echoCancellation: true, // 에코 취소 활성화
                        noiseSuppression: true, // 배경 소음 억제 활성화
                        autoGainControl: true // 자동 이득 제어 활성화
                    },
                    video: false
                };
                try {
                    stream = await navigator.mediaDevices.getUserMedia(contraints);
                    if (myAudio.current) {
                        myAudio.current.srcObject = stream;
                    }
                    setMyStream(stream);
                } catch (error) {
                    console.error(error);
                }
            };
            const makeConnection = () => {
                if (stream) {
                    stream
                        .getTracks()
                        .forEach((track) => peerConnection.addTrack(track, stream as MediaStream));
                }
            };
            await getMedia();
            makeConnection();
        };

        startMedia();

        peerConnection.ontrack = ({ streams }) => {
            if (peerAudio.current) {
                peerAudio.current.srcObject = streams[0];
            }
        };


        socket?.on('rtc_start', async (room) => {
            console.log('RTC Connection Start!');

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket?.emit('offer', { offer, room });
            console.log('send the offer');
        });

        socket?.on('offer', async ({ offer, room }) => {

            await peerConnection.setRemoteDescription(offer);
            console.log('receive offer');
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket?.emit('answer', { answer, room });
            console.log('send answer!');
        });

        socket?.on('answer', async ({ answer, room }) => {
            peerConnection.addEventListener('icecandidate', ({ candidate }) => {
                console.log('candidate finish');
                socket?.emit('candidate', { candidate, room });
            });
            console.log('receive answer');
            await peerConnection.setRemoteDescription(answer);
        });

        socket?.on('candidate', async (candidate) => {
            console.log('receive candidate !');
            if (candidate) {
                await peerConnection.addIceCandidate(candidate);
                console.log('🚀 add ice candidate peer connection finish 🚀 ');
            }
        });
    }, []);

    function handleMyMuted() {
        if (myStream) {
            myStream
                .getAudioTracks()
                .forEach((track) => (track.enabled = !track.enabled));
        }
        setMyMuted((prev) => !prev);
    }



    function leaveRoom() {

        socket?.emit('leave-room', async (nickname: any) => {
            console.log(`${nickname} : leave the room`);

        })

        navigate("/");
    };

    return (
        <div>
            <>
                <span id="members">
                    {users.map((nickname) => (
                        <Box
                            key={nickname} // nickname을 key로 사용
                            className={`speaker user-rtc-${nickname}`}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                p: '2px',
                                // bgcolor: userVolumes[nickname] >= 40 ? '#00ff00' : '#fff',
                                border: '2px solid',
                                borderColor: 'transparent',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                                {/* {nickname[0].toUpperCase()} */}
                            </Avatar>
                        </Box>
                    ))}
                </span>
                <audio ref={myAudio} autoPlay playsInline />
                <Button onClick={handleMyMuted}>
                    {myMuted ? <MicOffIcon /> : <MicIcon />}
                </Button>
                <Button onClick={() => {
                    socket?.emit('rtc_start', room);
                }}
                >
                    Start
                </Button>
                <Button onClick={leaveRoom}>
                    <LogoutIcon />
                </Button>
            </>

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