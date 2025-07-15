import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function AttendanceBoard() {
  const nav                    = useNavigate();
  const { sessionId, sectionId } = useLocation().state; // passed from RecordPage
  const [logs, setLogs]        = useState([]);
  const [alive, setAlive]      = useState(false);
  const [authOK, setAuthOK]    = useState(false);

  /* open socket once */
  useEffect(() => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS}/ws/session/${sessionId}`
    );

    ws.onopen    = () => setAlive(true);
    ws.onclose   = () => setAlive(false);
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);        // event/data shape

      if (m.event === "auth:ok")           setAuthOK(true);
      if (m.event === "attendance:snapshot") setLogs(m.data);
      if (m.event === "attendance:add")      setLogs((l) => [...l, m.data]);
    };
    return () => ws.close();
  }, [sessionId]);

  /* helpers */
  const excelUrl = `${api.defaults.baseURL}/report/${sectionId}/export.xlsx?sessionId=${sessionId}`;

  /* ---------- render ---------- */
  return (
    <div className="board-wrap">
      {/* status bar */}
      <div className="status-bar">
        <span>
          Device&nbsp;
          {alive ? <b style={{ color: "green" }}>connected</b>
                 : <b style={{ color: "red"   }}>offline</b>}
        </span>
        &nbsp;|&nbsp;
        <span>
          Teacher&nbsp;
          {authOK ? <b style={{ color: "green" }}>authenticated</b>
                  : <b style={{ color: "red"   }}>waiting</b>}
        </span>

        <a href={excelUrl} className="btn-download" target="_blank">
          Download Excel
        </a>
      </div>

      {/* table */}
      <table className="att-table big">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>S No</th>
            <th>Name</th>
            <th>Enrollment Number</th>
            <th style={{ width: "140px" }}>Time Stamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                — no scans yet —
              </td>
            </tr>
          ) : (
            logs
              .filter((l) => l.student)     // guard
              .map((l, i) => (
                <tr key={l.id}>
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

      <button className="btn-back" onClick={() => nav(-1)}>
        Back
      </button>
    </div>
  );
}
