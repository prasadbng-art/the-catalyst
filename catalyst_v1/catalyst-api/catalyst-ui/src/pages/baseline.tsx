import { useEffect, useState } from "react";
import { fetchBaseline } from "../api/baseline";
import type { BaselineResponse } from "../types/api";

export default function BaselinePage() {
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBaseline()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading baseline…</div>;

  return (
    <div>
      <h1>Baseline</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
