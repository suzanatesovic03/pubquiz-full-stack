import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, clearAuth, getUser } from "../api";

export default function Navbar() {
  const [activeSeason, setActiveSeason] = useState(null);
  const user = getUser();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    api
      .getActiveSeason()
      .then(setActiveSeason)
      .catch(() => setActiveSeason(null));
  }, [loc.pathname]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    clearAuth();
    nav("/login");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          Pub Quiz
        </Link>

        <div className="header-right">
          {activeSeason && (
            <div className="active-season">
              <strong>Aktivna sezona: </strong>
              {activeSeason.name} &nbsp;|&nbsp; {activeSeason.start_date} — {activeSeason.end_date}
            </div>
          )}

          {!user ? (
            <div className="auth-links">
              <Link className="btn small ghost" to="/login">Prijava</Link>
              <Link className="btn small" to="/register">Registracija</Link>
            </div>
          ) : (
            <div className="auth-links">
              <span className="user-pill">{user.name}{user.is_admin ? " (admin)" : ""}</span>
              <button onClick={handleLogout} className="btn small">Odjava</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
