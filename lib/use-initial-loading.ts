import { useEffect, useState } from "react";

/**
 * True for a short moment after mount, so tables can show their skeleton.
 * Pages currently read local sample data; once they fetch from an API, replace this with the
 * query's own loading flag (e.g. `isLoading` from the data layer) and keep passing it to <DataTable loading />.
 */
export function useInitialLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(timer);
  }, [ms]);
  return loading;
}
