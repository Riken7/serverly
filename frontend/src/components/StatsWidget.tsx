import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

export function StatsWidget() {
  const [stats, setStats] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const fetchStats = () => {
    axios
      .get("/onepulse/api/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats(null));
  };

  useEffect(() => {
    axios.get("/onepulse/api/config").then((res) => {
      if (res.data?.refreshInterval) {
        setRefreshInterval(res.data.refreshInterval * 1000);
      }
    });

    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="mt-6 w-full max-w-6xl mx-auto">
      <h2
        className="text-2xl font-semibold mb-4"
        style={{ color: theme.heading.green }}
      >
        System Stats
      </h2>

      <div
        className="rounded-lg shadow-md border-2  overflow-x-auto"
        style={{
          borderColor: theme.heading.green,
          backgroundColor: "#1e1e1e",
          fontSize: "1.05rem",
          padding: "1.25rem",
        }}
      >
        {stats ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">CPU Load</span>
              <span className="font-mono text-lg text-white">
                {stats.cpuLoad.map((n: number) => n.toFixed(2)).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Memory</span>
              <span className="font-mono text-lg text-blue-300">
                {stats.memory.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used Memory</span>
              <span className="font-mono text-lg text-red-400">
                {stats.memory.used}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Free Memory</span>
              <span className="font-mono text-lg text-green-400">
                {stats.memory.free}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}
