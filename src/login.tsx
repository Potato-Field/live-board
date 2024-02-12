import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import potatoLogo from './image/potato.png';
import "./index.css"

interface User {
    nickname: string;
  }

const Login = () => {
    const [username, setUsername] = useState('');
    // const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    // 서버요청해서 user목록 불러와야함. 
    const [users, setUsers] = useState<User[]>([]);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 유저 목록에서 같은유저있는지 찾는 boolean
        const existingUser = users.find(user => user.nickname === username);

    
        if(existingUser) {
            return{error: '이미 존재하는 사용자 이름입니다.'}
        }else{
            // 서버에 요청하여 users 목록 업데이트해야함.
            setUsers(prevUsers => [...prevUsers, { nickname: username }]);
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
        <div id="center-container">
            <header>
                <img src={potatoLogo} alt="Potato Logo" />
                <h1>Live-Board</h1>
            </header>
            <div id="welcome">
            <form onSubmit={handleSubmit}>
                    <input
                        id="nickname"
                        type="text"
                        required
                        placeholder="input nickname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button type="submit" >Enter</button>
                </form>
            </div>
        </div>
    );
};

export default Login;