// import express from 'express';
import http from "http"
import { Server } from "socket.io"


// const app = express();
const httpServer = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('okay')
});

const io = new Server(httpServer, {
    cors: {
        //origin: "", // 모든 도메인 허용
        //methods: ["GET", "POST"], // 허용할 HTTP 메소드
        //credentials: true // 쿠키를 허용할지 여부
    }
});


const PORT = process.env.PORT || 1111;

let users = [];

function addUser({ id, nickname, room }) {
    nickname = nickname.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    // 동일한 방에서 동일한 이름을 가진 사용자가 이미 존재하는지 확인
    const existingUser = users.find((user) => user.room === room && user.nickname === nickname);
    
    // 새 사용자 객체 생성
    const user = { id, nickname, room };
    users.push(user);
    console.log("유저목록에 추가했습니다.");

    if (existingUser) {
        return { error: '이미 존재하는 사용자 이름입니다.' };
    }


    return { user }; // 성공적으로 추가된 경우, 오류 없이 사용자 정보 반환
}

function getUsersInRoom(room) {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

// 사용자를 users 배열에서 제거하는 함수
function removeUser(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]; // 제거된 사용자 객체를 반환
    }
}

io.on('connection', (socket) => {
    console.log("유저 접속");
    // 새 사용자가 연결될 때
    socket.on('join', ({ nickname, room }) => {
        const { error, user } = addUser({ id: socket.id, nickname, room });

        // user 객체가 정상적으로 반환되지 않았다면 (즉, undefined 이거나 error 가 존재한다면)
        if (error || !user) {
            console.error(error || 'User 객체를 생성하는데 실패했습니다.');
            return;
        }
        socket.join(user.room);
        // socket.emit('rtc_start',room)
        console.log("유저가 room 에 입장했습니다.");

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    })


    // socket 통신
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
        console.log(`User disconnected: ${socket.id}`);
    });


    socket.on('leave-room', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
        console.log(`유저가 방을 퇴장했습니다.: ${socket.id}`);
    });

    socket.on("rtc_start", (room) => {
        socket.to(room).emit("rtc_start", room);
    });

    socket.on("offer", ({ offer, room }) => {
        socket.to(room).emit("offer", { offer, room });
        console.log("offer받음");
    });

    socket.on("answer", ({ answer, room }) => {
        socket.to(room).emit("answer", { answer, room });
        console.log("answer받음");
    });

    socket.on("candidate", ({ candidate, room }) => {
        socket.to(room).emit("candidate", candidate);
        console.log("ice확인");
    });

});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
