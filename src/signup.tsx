import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

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

export default function SignUp() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        // event.preventDefault();
        // const data = new FormData(event.currentTarget);
        // console.log({
        //     id: data.get('id'),
        //     password: data.get('password'),
        // });
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#E1E5EA' }}>
            <Container component="main" maxWidth="xs" style={{ backgroundColor: 'white', borderRadius: '10px'}}>
                <Typography component="h1" variant="h5"  sx={{ mt: 6, mb: 4, color: "#FF7A50", fontWeight: "bolder" }} >
                    회원가입
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
                        style={{backgroundColor: "#FF7A50", color: "white", fontWeight: "bold" }}
                        >
                        가입하기
                    </Button>
                    <Typography component="h1" variant="body2" sx={{ mt: 1, mb: 1 }} >
                        이미 계정이 있나요?
                        <Link href="/" color="inherit" variant="body2" sx={{ ml:1, color: "#FF7A50" }}>로그인</Link>
                    </Typography>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />
            </Container>
        </div>
    );
}