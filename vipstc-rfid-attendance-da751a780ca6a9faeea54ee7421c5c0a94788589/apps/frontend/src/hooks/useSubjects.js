import { useEffect, useState } from "react";
import api from "../lib/api";

export default function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/session/mine/subjects")
      .then((r) => mounted && setSubjects(r.data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { subjects, loading };
}
