// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import { getUsers, User } from './api/userService';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트가 켜질 때 백엔드에서 데이터를 서버에서 가져옴
    getUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        setError('백엔드 데이터를 불러오지 못했습니다. 서버를 켰는지 확인하세요.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>사용자 목록 테스트</h1>
      <hr />

      {loading && <p>데이터를 불러오는 중입니다...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p>존재하는 유저가 없습니다.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user) => (
            <li
              key={user.id}
              style={{
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                textAlign: 'left'
              }}
            >
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>이름:</strong> {user.username}</div>
              <div><strong>이메일:</strong> {user.email}</div>
              <div style={{ fontSize: '0.85em', color: '#aaa', marginTop: '5px' }}>
                <strong>가입일:</strong> {user.created_at}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
