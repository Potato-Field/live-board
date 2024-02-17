import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Link, Box, Typography, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
        Developed by Potato Field🥔
        <Link color="inherit" href="https://github.com/Potato-Field/live-board.git">
            Github
        </Link>
        </Typography>
    );
}

interface User {
    nickname: string;
    pwd: string;
}

export default function Login() {
    const theme = useTheme();

    const [username, setUsername] = useState('');
    const [userpwd, setUserpwd] = useState('');
    // const [loggedIn, setLoggedIn] = useState(false);

    const navigate = useNavigate();
    
    // 서버요청해서 user목록 불러와야함. 
    const [users, setUsers] = useState<User[]>([]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 유저 목록에서 같은유저있는지 찾는 boolean
        const existingUser = users.find(user => user.nickname === username);

        if(existingUser) {
            return{error: '이미 존재하는 사용자 이름입니다.'}
        }else{
            // 서버에 요청하여 users 목록 업데이트해야함.
            setUsers(prevUsers => [...prevUsers, { nickname: username, pwd: userpwd }]);
            navigate('/lobby', { state: { nickname: username} });
        }

        // 로그인 로직 구현
        // 예를 들어, 로그인 상태를 전역 상태로 설정하거나 쿠키/로컬 스토리지에 저장
        // console.log('로그인 시도:', username);

        // // 로그인 성공 후 리다이렉트
        // setLoggedIn(true);
        // console.log(loggedIn);
        
        // navigate('/app', { state: { nickname: username, loggedIn: true } });
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', backgroundColor: theme.palette.secondary.main }}>
            <Container component="main" maxWidth="xs" style={{ backgroundColor: 'white', borderRadius: '10px'}}>
                <Typography component="h1" variant="h5"  sx={{ mt: 6, mb: 4, color: theme.palette.info.main, fontWeight: "bolder" }} >
                    {/* TODO: 라이브보드 로고 넣기 (= README logo) */}
                    Live Board
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="id"
                    label="아이디"
                    name="id"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="비밀번호"
                    type="password"
                    id="password"
                    value={userpwd}
                    onChange={(e) => setUserpwd(e.target.value)}
                    />
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{backgroundColor: theme.palette.info.main, color: "white", fontWeight: "bold", height: "56px", fontSize: "1rem" }}
                    >
                    로그인
                    </Button>
                    <Typography component="h1" variant="body2" sx={{ mt: 1, mb: 1 }} >
                        아직 회원이 아니신가요?
                        <Link href="/signup" variant="body2" sx={{ ml:1, color: theme.palette.info.main }}>회원가입</Link>
                    </Typography>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Container>
        </div>
    );
}