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


export default function Login() {

    const baseUrl = "https://www.jungleweb.duckdns.org";
    const theme = useTheme();
    const [nickname, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        try {
            const response = await fetch(baseUrl + '/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // 로그인 성공 처리
                // 예를 들어, 사용자 상태 설정, 홈페이지로 리다이렉트 등
                navigate('/lobby', { state: { nickname: nickname, ...data } });
            } else {
                // 로그인 실패 처리
                // 예를 들어, 에러 메시지 표시
                alert('로그인 실패: 잘못된 사용자 이름 또는 비밀번호');
            }
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
        }

    
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', backgroundColor: theme.palette.secondary.main }}>
            <Container component="main" maxWidth="xs" style={{ backgroundColor: 'white', borderRadius: '10px' }}>
                <Typography component="h1" variant="h5" sx={{ mt: 6, mb: 4, color: theme.palette.info.main, fontWeight: "bolder" }} >
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
                        value={nickname}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ backgroundColor: theme.palette.info.main, color: "white", fontWeight: "bold", height: "56px", fontSize: "1rem" }}
                    >
                        로그인
                    </Button>
                    <Typography component="h1" variant="body2" sx={{ mt: 1, mb: 1 }} >
                        아직 회원이 아니신가요?
                        <Link href="/signup" variant="body2" sx={{ ml: 1, color: theme.palette.info.main }}>회원가입</Link>
                    </Typography>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Container>
        </div>
    );
}