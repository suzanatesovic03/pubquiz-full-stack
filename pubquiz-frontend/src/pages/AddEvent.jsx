import { useState, useEffect } from "react";
import axios from "axios";

export default function AddEventForm() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/teams").then((res) => {
      setTeams(res.data.data);
    });

    axios.get("http://127.0.0.1:8000/api/seasons").then((res) => {
      setSeasons(res.data);
    });
  }, []);

  const handleAddTeam = (teamId) => {
    if (!selectedTeams.some((t) => t.id === teamId)) {
      setSelectedTeams([...selectedTeams, { id: teamId, score: 0 }]);
    }
  };

  const handleScoreChange = (teamId, score) => {
    setSelectedTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, score: parseInt(score) || 0 } : t
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(
      "http://127.0.0.1:8000/api/events",
      {
        title,
        date,
        season_id: seasonId,
        teams: selectedTeams,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    alert("Event created successfully!");
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Dodaj novi Event</h2>

      <label>Naslov eventa:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>Datum:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <label>Sezona:</label>
      <select
        value={seasonId}
        onChange={(e) => setSeasonId(e.target.value)}
        required
      >
        <option value="">Izaberi sezonu</option>
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <h3>Dodaj timove i poene:</h3>
      <select onChange={(e) => handleAddTeam(parseInt(e.target.value))}>
        <option value="">Izaberi tim</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {selectedTeams.map((t) => (
        <div key={t.id} style={{ marginTop: 10 }}>
          <strong>
            {teams.find((team) => team.id === t.id)?.name || "Nepoznat tim"}:
          </strong>{" "}
          <input
            type="number"
            value={t.score}
            onChange={(e) => handleScoreChange(t.id, e.target.value)}
            style={{ width: 80 }}
          />{" "}
          poena
        </div>
      ))}

      <button type="submit" style={{ marginTop: 20 }}>
        Sačuvaj Event
      </button>
    </form>
  );
}
