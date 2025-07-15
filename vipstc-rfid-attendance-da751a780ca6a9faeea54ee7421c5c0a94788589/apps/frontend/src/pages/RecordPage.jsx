// apps/frontend/src/pages/RecordPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import './RecordPage.css';  // your existing styles

export default function RecordPage() {
  const { subjectInstId } = useParams();
  const nav               = useNavigate();

  // ▶︎ lookup sectionId from the teacher's subjects
  const [sectionId, setSectionId] = useState(null);
  useEffect(() => {
    api.get('/session/mine/subjects').then(res => {
      const me = res.data.find(si => si.id === Number(subjectInstId));
      if (me && me.section) setSectionId(me.section.id);
    });
  }, [subjectInstId]);

  // ─── phases & date/time ─────────────────────────────
  const [phase, setPhase] = useState('pick');
  const today             = new Date().toISOString().slice(0,10);
  const nowHM             = new Date().toTimeString().slice(0,5);
  const [date, setDate]   = useState(today);
  const [time, setTime]   = useState(nowHM);

  // ─── session & attendance logs ──────────────────────
  const [sessionId, setSessionId] = useState(null);
  const [authOk, setAuthOk]       = useState(false);
  const [logs, setLogs]           = useState([]);

  // open WS when sessionId arrives
  useEffect(() => {
    if (!sessionId) return;
    const wsUrl = `${import.meta.env.VITE_WS}/ws/session/${sessionId}`;
    const ws    = new WebSocket(wsUrl);

    ws.onmessage = e => {
      const { event, data } = JSON.parse(e.data);
      if (event === 'auth:ok') {
        setAuthOk(true);
        setPhase('live');
      }
      if (event === 'attendance:snapshot') {
        setLogs(data.map(r => ({
          id:    `snap-${r.studentId}`,
          student: { name: r.name, enrollmentNo: r.enrol },
          timestamp: r.time ? new Date(r.time).toISOString() : null
        })));
      }
      if (event === 'attendance:add') {
        setLogs(prevLogs => 
          prevLogs.map(log => {
            // Find the student who just scanned
            if (log.student.enrollmentNo === data.enrol) {
              // Return a new object for this student with the updated timestamp
              return { ...log, timestamp: new Date(data.time).toISOString() };
            }
            // Otherwise, return the original log object
            return log;
          })
        );
      }
    };

    return () => ws.close();
  }, [sessionId]);

  // sort so that entries with a timestamp (i.e. present) come first
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a,b) => (!!b.timestamp) - (!!a.timestamp));
  }, [logs]);

  // ─── handlers ────────────────────────────────────────

  // Start: open a session
  async function handleNext(e) {
    e.preventDefault();
    const startAt = new Date(`${date}T${time}:00`);
    if (startAt > new Date()) {
      toast.error('Future time not allowed');
      return;
    }
    const { data } = await api.post('/session/open', {
      subjectInstId: Number(subjectInstId),
      startAt:       startAt.toISOString()
    });
    setSessionId(data.sessionId);
    setPhase('wait');
    setAuthOk(false);
    setLogs([]);
  }

  // Done: close session
  async function handleDone() {
    if (!window.confirm('Close attendance?')) return;
    await api.patch(`/session/close/${sessionId}`);
    nav(-1);
  }

  // Download Excel report for this section & date
  async function downloadExcel() {
    if (!sectionId) {
      toast.error('Section unknown');
      return;
    }
    try {
      // matches your backend GET /api/report/:sectionId/export.xlsx
      const url = `/report/${sectionId}/export.xlsx`
                + `?from=${date}&to=${date}`;
      const resp = await api.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob(
        [resp.data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      ));
      const a = document.createElement('a');
      a.href     = blobUrl;
      a.download = `attendance_${sectionId}_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Failed to download report');
    }
  }

  // ─── render ───────────────────────────────────────────
  return (
    <div className="record-page">
      <Toaster />

      {/* Phase 1: pick */}
      {phase === 'pick' && (
        <form onSubmit={handleNext} className="form-box">
          <h2>Select Date &amp; Time</h2>
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Next</button>
        </form>
      )}

      {/* Phase 2: waiting */}
      {phase === 'wait' && (
        <div className="status-box">
          {authOk
            ? <h2 className="green">Device authenticated ✅</h2>
            : <h2>Waiting for device authentication…</h2>
          }
        </div>
      )}

      {/* Phase 3: live */}
      {phase === 'live' && (
        <>
          <div className="actions-row">
            <button onClick={downloadExcel} className="btn-secondary">
              Download Excel
            </button>
            <Link to="/dashboard" className="btn-back">Back</Link>
          </div>

          <div className="status-box">
            {authOk
              ? <h2 className="green">Device authenticated ✅</h2>
              : <h2 className="red">Device disconnected</h2>
            }
          </div>

          <div className="table-container">
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
                {sortedLogs.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="empty">— no scans yet —</td>
                    </tr>
                  ) : (
                    sortedLogs.map((l,i) => (
                      <tr key={l.id}>
                        <td>{i+1}</td>
                        <td>{l.student.name}</td>
                        <td>{l.student.enrollmentNo}</td>
                        <td>{
                          l.timestamp
                            ? new Date(l.timestamp).toLocaleTimeString('en-IN', {
                                hour:   '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            : '—'
                        }</td>
                      </tr>
                    ))
                  )
                }
              </tbody>
            </table>
          </div>

          <button onClick={handleDone} className="btn-done">Done</button>
        </>
      )}
    </div>
  );
}