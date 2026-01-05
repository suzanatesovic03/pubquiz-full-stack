// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { api, apiFetch, getUser } from "../api";

export default function Dashboard({ adminMode = false }) {
  const user = getUser();
  const isAdmin = !!user?.is_admin;

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsLastPage, setEventsLastPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [seasonBoard, setSeasonBoard] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventBoard, setEventBoard] = useState([]);
  const [myResults, setMyResults] = useState(null);
  const [trivia, setTrivia] = useState([]);

  const [allTeams, setAllTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsLastPage, setTeamsLastPage] = useState(1);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventSeason, setNewEventSeason] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);

  const fetchAllTeams = async (page = 1) => {
    setLoadingTeams(true);
    try {
      const data = await apiFetch(`/teams?page=${page}&per_page=10`);
      setAllTeams(data.data || []);
      setTeamsPage(data.meta?.current_page || 1);
      setTeamsLastPage(data.meta?.last_page || 1);
    } catch (err) {
      console.error("Greška pri učitavanju timova", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm("Da li sigurno želiš da obrišeš ovaj tim?")) return;
    try {
      await apiFetch(`/teams/${id}`, { method: "DELETE" });
      setAllTeams(allTeams.filter((t) => t.id !== id));
      alert("Tim uspešno obrisan!");
    } catch (err) {
      alert("Greška pri brisanju tima.");
    }
  };

  const nextTeamsPage = () => {
    if (teamsPage < teamsLastPage) {
      const newPage = teamsPage + 1;
      setTeamsPage(newPage);
      fetchAllTeams(newPage);
    }
  };

  const prevTeamsPage = () => {
    if (teamsPage > 1) {
      const newPage = teamsPage - 1;
      setTeamsPage(newPage);
      fetchAllTeams(newPage);
    }
  };

  useEffect(() => {
    api.getSeasons().then((data) => setSeasons(data.data || []));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .myTeamResults()
        .then((data) => {
          if (data.team_name) setMyResults(data);
        })
        .catch(() => setMyResults(null));
    }
  }, []);
  
  const fetchEvents = async (seasonId, page = 1) => {
    const params = {
      page,
      per_page: 20,
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
    };
    const data = await api.getSeasonEvents(seasonId, params);
    setEvents(data.data || data);
    setEventsPage(data?.meta?.current_page || 1);
    setEventsLastPage(data?.meta?.last_page || 1);
  };

  const selectSeason = async (seasonId) => {
    setSelectedSeason(seasonId);
    setSeasonBoard([]);
    setSelectedEvent(null);
    setEventBoard([]);
    setDateFrom("");
    setDateTo("");
    await fetchEvents(seasonId, 1);
  };

  const filterEvents = async () => {
    if (!selectedSeason) return;
    await fetchEvents(selectedSeason, 1);
  };

  const prevPage = async () => {
    if (eventsPage <= 1 || !selectedSeason) return;
    await fetchEvents(selectedSeason, eventsPage - 1);
  };

  const nextPage = async () => {
    if (eventsPage >= eventsLastPage || !selectedSeason) return;
    await fetchEvents(selectedSeason, eventsPage + 1);
  };

  const loadSeasonLeaderboard = async () => {
    if (!selectedSeason) return;
    const data = await api.seasonLeaderboard(selectedSeason);
    setSeasonBoard(Array.isArray(data) ? data : []);
  };

  const loadEventLeaderboard = async (eventId) => {
    const data = await api.eventLeaderboard(eventId);
    setSelectedEvent(eventId);
    setEventBoard(Array.isArray(data) ? data : []);
  };

  const exportSeasonCSV = () => {
    if (!seasonBoard.length) return;
    const header = "Team,Total Score\n";
    const rows = seasonBoard
      .map((t) => `${t.name},${t.total_score}`)
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "season_leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchTrivia = async () => {
    const qs = await api.publicTrivia(3);
    setTrivia(
      qs.map((q) => ({
        question: decode(q.question),
        answers: shuffle([
          ...q.incorrect_answers.map(decode),
          decode(q.correct_answer),
        ]),
        correct: decode(q.correct_answer),
        category: q.category,
      }))
    );
  };

  function decode(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }
  function shuffle(arr) {
    return arr
      .map((x) => ({ x, s: Math.random() }))
      .sort((a, b) => a.s - b.s)
      .map((o) => o.x);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .myTeamResults()
        .then((data) => {
          if (data.team_name) setMyResults(data);
        })
        .catch(() => setMyResults(null));
    }
  }, []);

 

  return (
    <>
      {myResults && (
        <section className="card">
          <h2>Rezultati mog tima</h2>
          <h3 style={{ color: "#9fa8ff" }}>{myResults.team_name}</h3>
          <ul className="leaderboard small">
            {myResults.results.map((r, i) => (
              <li key={i}>
                <span>
                  {r.event_title} —{" "}
                  {new Date(r.event_date).toLocaleDateString()}
                </span>
                <strong>{r.score} poena</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Sezone</h2>
        <div className="season-grid">
          {seasons.map((s) => (
            <div
              key={s.id}
              className={`season-item ${
                selectedSeason === s.id ? "selected" : ""
              }`}
              onClick={() => selectSeason(s.id)}
            >
              <strong>{s.name}</strong>
              <span>
                {s.start_date} — {s.end_date}
              </span>
            </div>
          ))}
        </div>
      </section>

      {selectedSeason && (
        <section className="card">
          <h2>Događaji u sezoni</h2>

          <div className="filter-bar">
            <input
              type="date"
              className="date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span>do</span>
            <input
              type="date"
              className="date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <button className="btn small" onClick={filterEvents}>
              📅 Filtriraj
            </button>
          </div>

          {events.length ? (
            <div className="event-grid">
              {events.map((e) => (
                <div key={e.id} className="event-item">
                  <h3>{e.title}</h3>
                  <p className="event-date">📅 {e.date}</p>
                  <button
                    className="btn small"
                    onClick={() => loadEventLeaderboard(e.id)}
                  >
                    Rezultati kola
                  </button>

                  {selectedEvent === e.id && (
                    <ul className="leaderboard small">
                      {eventBoard.map((t) => (
                        <li key={t.id}>
                          <span>{t.name}</span>
                          <strong>{t.score}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Nema događaja za zadati filter.</p>
          )}

          <div className="pagination">
            <button
              className="btn small"
              onClick={prevPage}
              disabled={eventsPage <= 1}
            >
              ← Prethodna
            </button>
            <span>
              Stranica {eventsPage} / {eventsLastPage}
            </span>
            <button
              className="btn small"
              onClick={nextPage}
              disabled={eventsPage >= eventsLastPage}
            >
              Sledeća →
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button className="btn" onClick={loadSeasonLeaderboard}>
              Rang lista sezone
            </button>
            {!!seasonBoard.length && (
              <button
                className="btn ghost"
                style={{ marginLeft: 8 }}
                onClick={exportSeasonCSV}
              >
                ⭳ Izvezi CSV
              </button>
            )}
          </div>

          {!!seasonBoard.length && (
            <ul className="leaderboard">
              {seasonBoard.map((t) => (
                <li key={t.id}>
                  <span>{t.name}</span>
                  <strong>{t.total_score}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="card">
        <h2>Pitanja sa kviza</h2>
        <button className="btn" onClick={fetchTrivia}>
          Učitaj 3 nasumična pitanja
        </button>
        {!!trivia.length && (
          <ul className="trivia-list" style={{ marginTop: 12 }}>
            {trivia.map((q, i) => (
              <li key={i}>
                <strong>
                  {i + 1}. {q.question}
                </strong>
                <br />
                <em>Opcije:</em> {q.answers.join(", ")}
                <br />
                <em>Tačno:</em> {q.correct}
              </li>
            ))}
          </ul>
        )}
      </section>
      {isAdmin && (
        <section className="card">
          <h2>Admin: Lista svih timova</h2>
          <button className="btn small" onClick={() => fetchAllTeams(1)}>
            🔄 Učitaj timove
          </button>

          {loadingTeams && <p>Učitavanje...</p>}

          {!loadingTeams && allTeams.length > 0 && (
            <>
              <ul
                className="leaderboard small"
                style={{ marginTop: 10, maxHeight: 400, overflowY: "auto" }}
              >
                {allTeams.map((team) => (
                  <li
                    key={team.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{team.name}</strong> (poeni: {team.score})
                    </span>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="btn small ghost"
                      style={{
                        backgroundColor: "#ffcccc",
                        border: "1px solid #cc0000",
                        color: "#cc0000",
                      }}
                    >
                      ❌ Obriši
                    </button>
                  </li>
                ))}
              </ul>

              <div
                className="pagination"
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button
                  className="btn small"
                  onClick={prevTeamsPage}
                  disabled={teamsPage <= 1}
                >
                  ← Prethodna
                </button>
                <span>
                  Stranica {teamsPage} / {teamsLastPage}
                </span>
                <button
                  className="btn small"
                  onClick={nextTeamsPage}
                  disabled={teamsPage >= teamsLastPage}
                >
                  Sledeća →
                </button>
              </div>
            </>
          )}

          {!loadingTeams && !allTeams.length && <p>Nema timova u bazi.</p>}
        </section>
      )}

      {isAdmin && (
        <section className="card">
          <form
            className="event-form"
            onSubmit={async (e) => {
              e.preventDefault();

              try {
                await apiFetch("/events", {
                  method: "POST",
                  body: JSON.stringify({
                    title: newEventTitle,
                    date: newEventDate,
                    season_id: newEventSeason,
                    teams: selectedTeams,
                  }),
                });

                alert("Event uspešno dodat!");
                setNewEventTitle("");
                setNewEventDate("");
                setNewEventSeason("");
                setSelectedTeams([]);
              } catch (err) {
                alert("Greška pri dodavanju eventa!");
              }
            }}
          >
            <h2>Dodaj novi event</h2>

            <label>Naslov eventa:</label>
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
            />

            <label>Datum:</label>
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              required
            />

            <label>Sezona:</label>
            <select
              value={newEventSeason}
              onChange={(e) => setNewEventSeason(e.target.value)}
              required
            >
              <option value="">Izaberi sezonu</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <h4 style={{ marginTop: "1rem" }}>Dodaj timove i poene:</h4>
            <select
              onChange={(e) => {
                const teamId = parseInt(e.target.value);
                if (teamId && !selectedTeams.some((t) => t.id === teamId)) {
                  setSelectedTeams([
                    ...selectedTeams,
                    { id: teamId, score: 0 },
                  ]);
                }
              }}
            >
              <option value="">Izaberi tim</option>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <div className="team-list">
              {selectedTeams.map((t) => (
                <div key={t.id} className="team-score">
                  <strong>{allTeams.find((tm) => tm.id === t.id)?.name}</strong>
                  <input
                    type="number"
                    value={t.score}
                    onChange={(e) =>
                      setSelectedTeams((prev) =>
                        prev.map((tm) =>
                          tm.id === t.id
                            ? { ...tm, score: parseInt(e.target.value) || 0 }
                            : tm
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <button type="submit">Sačuvaj Event</button>
          </form>
        </section>
      )}
    </>
  );
}
