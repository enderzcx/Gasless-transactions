function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <button className="login-btn" onClick={onLogin}>
        登录
      </button>
    </div>
  );
}

export default LoginPage;

