import * as React from 'react';
import { Button, TextField, Box, Typography, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Copyright from './component/Copyright';

import logo from './assets/signupLogo.png';
// import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function SignUp() {
    const theme = useTheme();

    const baseUrl = "https://www.jungleweb.monster";
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const navigate = useNavigate();

    const [showText, setShowText] = useState(false);

    // 아래 DB url 에 응답으로 nickname 중복확인
    const checkNicknameExists = async (nickname: any) => {
        const url = `${baseUrl}/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`;
        console.log(`Sending request to: ${url}`); // Debugging: Log the full URL
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return data.exists;
            } else {
                console.error('Server responded with an error', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // navigate('/');

        // 비밀번호 일치확인
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다');
            return;
        }

        // nickname 중복확인
        const nicknameExists = await checkNicknameExists(nickname);
        if (nicknameExists) {
            alert('이미 사용중인 아이디입니다.');
            return;
        }

        try {
            const response = await fetch(baseUrl + '/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, password }),
            });
            if (response.ok) {
                alert('가입이 완료되었습니다.');
                navigate('/');
            } else {
                // 오류 처리
                alert('회원가입 실패. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', backgroundColor: theme.palette.secondary.main }}>
            <Container component="main" maxWidth="xs" className='loginContainer'>
                <img src={logo} alt='Logo' className='logo signupLogo' />

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="nickname"
                        label="아이디"
                        name="nickname"
                        onChange={(e) => setNickname(e.target.value)}
                        onFocus={() => setShowText(true)}
                        onBlur={() => setShowText(false)}
                    />
                    <p id = "idInputAlert">
                        { showText ? '영문 대소문자와 숫자, 특수기호만 사용 가능합니다.' : null}
                    </p>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="비밀번호"
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                    >
                    </TextField>

                    {/* <Visibility></Visibility> */}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="passwordCheck"
                        label="비밀번호 확인"
                        type="password"
                        id="passwordCheck"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ backgroundColor: theme.palette.info.main, color: "white", fontWeight: "bold", height: "56px", fontSize: "1rem" }}
                    >
                        가입하기
                    </Button>
                    
                    <Typography component="h1" variant="body2" sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} >
                        이미 계정이 있나요?
                        <Button href="/" color="inherit" sx={{ color: theme.palette.info.main }}>로그인</Button>
                    </Typography>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Container>
        </div>
    );
}