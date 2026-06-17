export default function LoginForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <label>
        Email or phone
        <input name="login" type="text" placeholder="Email or phone" />
      </label>
      <label>
        Password
        <input name="password" type="password" placeholder="Password" />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}
