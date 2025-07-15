// src/components/SectionCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SectionCard.css";          // <‑‑ add this import

export default function SectionCard({ section }) {
  const navigate = useNavigate();
  const { sectionId, sectionName, courseName, semesterNo } = section;

  const labelTop = `${courseName.toUpperCase()} ${semesterNo}${sectionName}`;
  const labelBottom = "ABC"; // subtitle placeholder

  return (
    <div
      className="section-card"
      onClick={() =>
        navigate(`/dashboard/teacher/record/${sectionId}`, { state: section })
      }
    >
      <h3>{labelTop}</h3>
      <p>{labelBottom}</p>

      <div className="btn‑row">
        <button
          className="record"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/teacher/record/${sectionId}`, { state: section });
          }}
        >
          Record
        </button>
        <button
          className="retrieve"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/teacher/report/${sectionId}`, { state: section });
          }}
        >
          Retrieve
        </button>
      </div>

      <button
        className="add‑student"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dashboard/teacher/add-student/${sectionId}`, { state: section });
        }}
      >
        + Add Student
      </button>
    </div>
  );
}
