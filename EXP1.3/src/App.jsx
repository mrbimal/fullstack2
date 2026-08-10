import { useEffect, useMemo, useState } from 'react';

const VALID_USER = {
  username: 'student',
  password: 'experiment',
  name: 'Student User',
  role: 'learner'
};

const mockSignJwt = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoded = (obj) => btoa(JSON.stringify(obj));
  const signature = btoa(`${encoded(header)}.${encoded(payload)}.signature`);
  return `${encoded(header)}.${encoded(payload)}.${signature}`;
};

const parseJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const getStoredToken = () => window.localStorage.getItem('jwt_token');

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(() => parseJwt(getStoredToken()));

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      setUser(parseJwt(stored));
    }
  }, []);

  const isAuthenticated = Boolean(token && user);

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');

    if (username.trim() !== VALID_USER.username || password !== VALID_USER.password) {
      setError('Invalid credentials. Use student / experiment');
      return;
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 15;
    const payload = {
      sub: VALID_USER.username,
      name: VALID_USER.name,
      role: VALID_USER.role,
      iat: issuedAt,
      exp: expiresAt
    };

    const jwt = mockSignJwt(payload);
    window.localStorage.setItem('jwt_token', jwt);
    setToken(jwt);
    setUser(payload);
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    window.localStorage.removeItem('jwt_token');
    setToken('');
    setUser(null);
    setError('');
  };

  const tokenInfo = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    if (!payload) return null;
    const now = Math.floor(Date.now() / 1000);
    return {
      ...payload,
      valid: payload.exp > now,
      expiresIn: Math.max(0, payload.exp - now)
    };
  }, [token]);

  return (
    <div className="app-shell">
      <header className="hero-card">
        <p className="eyebrow">EXP1.3.1 • JWT Authentication Demo</p>
        <h1>Stateless token-based login</h1>
        <p>Mock JWT authentication with secure local storage and token validation flow.</p>
      </header>

      <main className="panel auth-panel">
        {isAuthenticated && user ? (
          <section className="session-card">
            <h2>Welcome back, {user.name}</h2>
            <p>You are authenticated as <strong>{user.role}</strong>.</p>
            <div className="details-grid">
              <div>
                <span>Username</span>
                <strong>{user.sub}</strong>
              </div>
              <div>
                <span>Token expires in</span>
                <strong>{tokenInfo?.expiresIn}s</strong>
              </div>
            </div>
            <button className="primary" onClick={handleLogout}>Log out</button>
          </section>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login with mock credentials</h2>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="student"
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="experiment"
                autoComplete="current-password"
              />
            </label>
            {error && <p className="error-message">{error}</p>}
            <button className="primary" type="submit">Sign in</button>
          </form>
        )}

        <section className="panel details-card">
          <h2>JWT details</h2>
          <p>This demo stores a mock JWT in <code>localStorage</code> and decodes it on each render.</p>
          {tokenInfo ? (
            <div className="token-summary">
              <div>
                <span>Token valid</span>
                <strong>{tokenInfo.valid ? 'Yes' : 'No'}</strong>
              </div>
              <div>
                <span>Issued at</span>
                <strong>{new Date(tokenInfo.iat * 1000).toLocaleString()}</strong>
              </div>
              <div>
                <span>Expiration</span>
                <strong>{new Date(tokenInfo.exp * 1000).toLocaleString()}</strong>
              </div>
            </div>
          ) : (
            <p className="empty-state">No active token found. Log in to generate a JWT token.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
