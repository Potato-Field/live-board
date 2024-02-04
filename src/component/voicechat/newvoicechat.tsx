import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io();

// Define TypeScript interfaces for better type checking
interface StreamWithTracks extends MediaStream {
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
}

interface PeerConnection {
  [key: string]: RTCPeerConnection;
}

// Assuming the existence of HTML elements in your JSX/TSX
const ChatApp: React.FC = () => {
  const myFace = useRef<HTMLVideoElement>(null);
  const [myStream, setMyStream] = useState<StreamWithTracks | null>(null);
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraOff, setCameraOff] = useState<boolean>(true);
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [peopleInRoom, setPeopleInRoom] = useState<number>(1);
  const pcObj = useRef<PeerConnection>({});

  // This function needs to be adapted to handle React state
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === "videoinput");
      // Update your state or context with the list of cameras
    } catch (error) {
      console.error(error);
    }
  };

  const getMedia = async (deviceId?: string) => {
    const initialConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId! } },
    };

    try {
      const stream: StreamWithTracks = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstraints
      );
      if (myFace.current) {
        myFace.current.srcObject = stream;
      }
      setMyStream(stream);
      if (!deviceId) {
        getCameras();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Adapt your event handlers to use React state
  const handleMuteClick = () => {
    if (!myStream) return;
    const enabled = !muted;
    myStream.getAudioTracks().forEach(track => (track.enabled = enabled));
    setMuted(!enabled);
  };

  // And so on for other functions...

  // Render method that returns your JSX including event listeners
  return (
    <div>
      <video ref={myFace} autoPlay playsInline muted={muted}></video>
      <button onClick={handleMuteClick}>{muted ? "Unmute" : "Mute"}</button>
      {/* Render other UI elements */}
    </div>
  );
};

export default ChatApp;