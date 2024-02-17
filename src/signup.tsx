import * as React from 'react';
import { Button, TextField, Link, Box, Typography, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Copyright from './component/Copyright'

export default function SignUp() {
    const theme = useTheme();

    // TODO: 회원가입 로직 구현
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            nickname: data.get('nickname'),
            pwd: data.get('pwd'),
        });
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', backgroundColor: theme.palette.secondary.main }}>
            <Container component="main" maxWidth="xs" style={{ backgroundColor: 'white', borderRadius: '10px'}}>
                <Typography component="h1" variant="h5"  sx={{ mt: 6, mb: 4, color: theme.palette.info.main, fontWeight: "bolder" }} >
                    회원가입
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {/** TODO
                     * input focus시 id 규칙 텍스트 띄도록
                     * 아이디: 영어, 숫자만
                     */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="id"
                        label="아이디"
                        name="id"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="비밀번호"
                        type="password"
                        id="password"
                    />
                    {/** TODO
                     * 비밀번호 같은지 확인
                     */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="passwordCheck"
                        label="비밀번호 확인"
                        type="password"
                        id="passwordCheck"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{backgroundColor: theme.palette.info.main, color: "white", fontWeight: "bold", height: "56px", fontSize: "1rem" }}
                        >
                        가입하기
                    </Button>
                    <Typography component="h1" variant="body2" sx={{ mt: 1, mb: 1 }} >
                        이미 계정이 있나요?
                        <Link href="/" color="inherit" variant="body2" sx={{ ml:1, color: theme.palette.info.main }}>로그인</Link>
                    </Typography>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Container>
        </div>
    );
}