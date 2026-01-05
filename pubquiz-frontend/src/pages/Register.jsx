import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuth } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    team_name: "",
  });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.register(form);
      setAuth(res.access_token, res.user);
      nav("/");
    } catch (error) {
      const msg =
        error?.data?.message ||
        (error?.data?.errors &&
          Object.values(error.data.errors).flat().join(" | ")) ||
        "Greška pri registraciji";
      setErr(msg);
    }
  };

  return (
    <section className="card narrow">
      <h2>Registracija</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Ime
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
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
          Naziv tima
          <input
            type="text"
            value={form.team_name || ""}
            onChange={(e) => setForm({ ...form, team_name: e.target.value })}
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
        <label>
          Potvrda lozinke
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={(e) =>
              setForm({ ...form, password_confirmation: e.target.value })
            }
          />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn" type="submit">
          Registruj se
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Imaš nalog? <Link to="/login">Prijavi se</Link>
      </p>
    </section>
  );
}
