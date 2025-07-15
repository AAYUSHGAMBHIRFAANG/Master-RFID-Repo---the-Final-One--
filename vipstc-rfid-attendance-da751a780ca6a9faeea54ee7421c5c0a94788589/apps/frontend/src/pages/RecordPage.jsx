// apps/frontend/src/pages/RecordPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function RecordPage() {
  const { subjectInstId } = useParams();
  const navigate = useNavigate();

  // Phase: 'pick' → 'wait' → 'live'
  const [phase, setPhase] = useState("pick");

  // Date & time inputs (defaults to today/current time)
  const today = new Date().toISOString().slice(0, 10);
  const nowHM = new Date().toTimeString().slice(0, 5);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowHM);

  // Session & attendance state
  const [sessionId, setSessionId] = useState(null);
  const [authOk, setAuthOk] = useState(false);
  const [logs, setLogs] = useState([]);

  // --- 1) Open WebSocket once we have a sessionId ---
  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS}/ws/session/${sessionId}`
    );

    ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }
      const { event, data } = msg;

      // 1A) Device authenticated
      if (event === "auth:ok") {
        setAuthOk(true);
        setPhase("live"); // gauge: you might want live only after first scan
      }

      // 1B) Full snapshot of all students (present/absent)
      if (event === "attendance:snapshot") {
        setLogs(
          Array.isArray(data)
            ? data.filter((r) => r.student && r.timestamp)
            : []
        );
        setPhase("live");
      }

      // 1C) Single new scan
      if (event === "attendance:add") {
        if (data?.student && data.timestamp) {
          setLogs((prev) => [...prev, data]);
          setPhase("live");
        }
      }
    };

    ws.onerror = () => {
      toast.error("WebSocket error");
    };

    return () => ws.close();
  }, [sessionId]);

  // --- Handlers ---
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
        startAt: startAt.toISOString(),
      });
      setSessionId(data.sessionId);
      setPhase("wait");
      setAuthOk(false);
      setLogs([]);
    } catch (err) {
      // api interceptor shows error toast
    }
  }

  async function handleDone() {
    if (!window.confirm("Close attendance?")) return;
    try {
      await api.patch(`/session/close/${sessionId}`);
      navigate(-1);
    } catch {
      toast.error("Failed to close session");
    }
  }

  // --- UI ---
  return (
    <div className="dashboard-wrap">
      <Toaster />

      {/* Phase 1: Pick date & time */}
      {phase === "pick" && (
        <form onSubmit={handleNext} className="form-box">
          <h2>Select Date & Time</h2>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary">
            Start
          </button>
        </form>
      )}

      {/* Phase 2: Wait for device auth */}
      {phase === "wait" && (
        <div className="status-box">
          {authOk ? (
            <h2 style={{ color: "green" }}>Device authenticated ✅</h2>
          ) : (
            <h2>Waiting for device authentication…</h2>
          )}
        </div>
      )}

      {/* Phase 3: Live attendance */}
      {phase === "live" && (
        <>
          <div className="status-box">
            {authOk ? (
              <h2 style={{ color: "green" }}>Device authenticated ✅</h2>
            ) : (
              <h2>Device disconnected</h2>
            )}
          </div>

          <table className="att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Enroll No.</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    — no scans yet —
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={`log-${l.id}`}>
                    <td>{i + 1}</td>
                    <td>{l.student.name}</td>
                    <td>{l.student.enrollmentNo}</td>
                    <td>
                      {new Date(l.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
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
