// src/hooks/useSections.js
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function useSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/session/mine/sections")
      .then((res) => {
        if (isMounted) setSections(res.data);
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, []);

  return { sections, loading };
}
