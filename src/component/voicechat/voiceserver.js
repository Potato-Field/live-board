//import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

//const app = express();
const server = createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
});

const io = new Server(server, {
    cors: {
      //origin: "", // 모든 도메인 허용
      //methods: ["GET", "POST"], // 허용할 HTTP 메소드
      //credentials: true // 쿠키를 허용할지 여부
    }
  });

const PORT = process.env.PORT || 1111;

let members = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // 새 사용자가 연결될 때
    socket.on('join-room', ({ nickname }) => {
        let member = { id: socket.id, nickname };
        members.push(member);
        io.emit('members-updated', members); // 모든 클라이언트에 멤버 리스트 업데이트
        console.log(members);
    });

    // 사용자가 방을 떠날 때
    socket.on('leave-room', () => {
        const index = members.findIndex(member => member.id === socket.id);
        if (index !== -1) {
            members.splice(index, 1);
            io.emit('members-updated', members); // 모든 클라이언트에 멤버 리스트 업데이트
        }
    });

    // 사용자 연결이 끊어졌을 때
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const index = members.findIndex(member => member.id === socket.id);
        if (index !== -1) {
            members.splice(index, 1);
            io.emit('members-updated', members); // 모든 클라이언트에 멤버 리스트 업데이트
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});