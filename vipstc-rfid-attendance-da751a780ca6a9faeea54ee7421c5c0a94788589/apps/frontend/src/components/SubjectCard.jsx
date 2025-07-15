import React from "react";
import { useNavigate } from "react-router-dom";
import "./SectionCard.css";           // you already have this

export default function SubjectCard({ item }) {
  const nav = useNavigate();
  const label = `${item.section.semester.course.name.split(" ")[0]} ${
    item.section.semester.number
  }${item.section.name}`;

  return (
    <div
      className="section-card"
      onClick={() => nav(`/dashboard/teacher/record/${item.id}`)}
    >
      <h3 style={{ fontSize: 18 }}>{item.subject.name}</h3>
      <p>{item.subject.code}</p>
      <small>{label}</small>

      <div className="btn‑row">
        <button
          className="record"
          onClick={(e) => {
            e.stopPropagation();
            nav(`/dashboard/teacher/record/${item.id}`);
          }}
        >
          Record
        </button>
        <button
          className="retrieve"
          onClick={(e) => {
            e.stopPropagation();
            nav(`/dashboard/teacher/report/${item.id}`);
          }}
        >
          Retrieve
        </button>
      </div>
    </div>
  );
}
