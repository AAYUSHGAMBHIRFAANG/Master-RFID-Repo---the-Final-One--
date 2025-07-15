import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function RecordPage() {
  const { subjectInstId } = useParams();
  const nav = useNavigate();

  /* phases: pick → wait → live */
  const [phase, setPhase]   = useState("pick");

  /* date & time defaults */
  const todayStr = new Date().toISOString().slice(0, 10);
  const timeStr  = new Date().toTimeString().slice(0, 5);

  const [date, setDate]         = useState(todayStr);
  const [time, setTime]         = useState(timeStr);
  const [sessionId, setSessionId] = useState(null);
  const [logs, setLogs]         = useState([]);
  const [authOk, setAuthOk]     = useState(false);

  /* ─── WebSocket life-cycle ───────────────────────── */
  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS}/ws/session/${sessionId}`
    );

    ws.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);

      if (event === "auth:ok") {
        setAuthOk(true);
      }

      if (event === "attendance:snapshot") {
        setLogs(data);
        setAuthOk(true);
        setPhase("live");
      }

      if (event === "attendance:add") {
        // only add well-formed records
        if (data && data.student) {
          setLogs((prev) => [...prev, data]);
          setPhase("live");
        }
      }
    };

    return () => ws.close();
  }, [sessionId]);

  /* ─── Handlers ───────────────────────────────────── */
  async function handleNext(e) {
    e.preventDefault();
    const startAt = new Date(`${date}T${time}:00`);
    if (startAt > new Date()) {
      toast.error("Future time not allowed");
      return;
    }
    try {
      const { data } = await api.post("/session/open", {
        subjectInstId: Number(subjectInstId),
        startAt:       startAt.toISOString(),
      });
      setSessionId(data.sessionId);
      setPhase("wait");
    } catch {
      /* global interceptor will toast */
    }
  }

  async function handleDone() {
    if (!window.confirm("Close attendance?")) return;
    try {
      await api.patch(`/session/close/${sessionId}`);
      nav(-1);
    } catch {
      toast.error("Failed to close session");
    }
  }

  /* ─── UI ──────────────────────────────────────────── */
  return (
    <div className="dashboard-wrap">
      <Toaster />

      {phase === "pick" && (
        <form onSubmit={handleNext} className="form-box">
          <h2>Select Date &amp; Time</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayStr}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Next
          </button>
        </form>
      )}

      {phase === "wait" && (
        <div className="status-box">
          {authOk ? (
            <h2 style={{ color: "green" }}>Device authenticated ✅</h2>
          ) : (
            <h2>Waiting for device authentication…</h2>
          )}
        </div>
      )}

      {phase === "live" && (
        <>
          <table className="att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Enroll No.</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    — no scans yet —
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={`log-${l.id || i}`}>
                    <td>{i + 1}</td>
                    <td>{l.student?.name || "—"}</td>
                    <td>{l.student?.enrollmentNo || "—"}</td>
                    <td>
                      {new Date(l.timestamp).toLocaleTimeString("en-IN", {
                        hour:   "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <button onClick={handleDone} className="btn-done">
            Done
          </button>
        </>
      )}
    </div>
  );
}
