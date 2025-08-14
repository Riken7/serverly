import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

export function DiskWidget() {
  const [disk, setDisk] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const fetchDisk = () => {
    axios
      .get("/onepulse/api/disk")
      .then((res) => setDisk(res.data.disk))
      .catch(() => setDisk(null));
  };

  useEffect(() => {
    axios.get("/onepulse/api/config").then((res) => {
      if (res.data?.refreshInterval) {
        setRefreshInterval(res.data.refreshInterval * 1000);
      }
    });

    fetchDisk();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchDisk, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="mt-6 w-full max-w-6xl mx-auto">
      <h2
        className="text-2xl font-semibold mb-4"
        style={{ color: theme.heading.green }}
      >
        Disk Usage
      </h2>

      <div
        className="rounded-lg shadow-md border-2 overflow-x-auto"
        style={{
          borderColor: theme.heading.green,
          backgroundColor: "#1e1e1e",
          padding: "1.25rem",
          fontSize: "1.05rem",
        }}
      >
        {disk ? (
          <pre className="whitespace-pre-wrap font-mono text-white">{disk}</pre>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}
