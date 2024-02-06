import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import potatoLogo from './image/potato.png';
import "./index.css"

const Login = () => {
    const [username, setUsername] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        // 로그인 로직 구현
        // 예를 들어, 로그인 상태를 전역 상태로 설정하거나 쿠키/로컬 스토리지에 저장
        console.log('로그인 시도:', username);
        // 로그인 성공 후 리다이렉트
        setLoggedIn(true);
        console.log(loggedIn);
        
        navigate('/app', { state: { nickname: username, loggedIn: true } });
    };



    return (
        <div id="center-container">
            <header>
                <img src={potatoLogo} alt="Potato Logo" />
                <h1>Live-Board</h1>
            </header>
            <div id="welcome">
                <form>
                    <input
                        id="nickname"
                        type="text"
                        required
                        placeholder="nickname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button type="button" onClick={handleSubmit}>Enter</button>
                </form>
            </div>
        </div>
    );
};

export default Login;