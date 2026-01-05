import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuth } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.login(form);
      setAuth(res.access_token, res.user);
      nav("/");
    } catch (error) {
      setErr(error?.data?.message || "Greška pri prijavi");
    }
  };

  return (
    <section className="card narrow">
      <h2>Prijava</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Lozinka
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn" type="submit">Prijavi se</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Nemaš nalog? <Link to="/register">Registruj se</Link>
      </p>
    </section>
  );
}
