import React from "react";
import useSubjects from "../hooks/useSubjects";
import SubjectCard from "../components/SubjectCard";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherDashboard() {
  const { subjects, loading } = useSubjects();

  React.useEffect(() => {
    if (!loading && subjects.length === 0) toast("No subjects assigned");
  }, [loading, subjects]);

  return (
    <div className="dashboard-wrap">
      <Toaster />
      <h1 className="title">Your Classes</h1>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="section-flex">
          {subjects.map((s) => (
            <SubjectCard key={s.id} item={s} />
          ))}
        </div>
      )}
    </div>
  );
}
