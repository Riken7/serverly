import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}d ${h}h ${m}m ${s}s`;
}

export function UptimeWidget() {
  const [uptime, setUptime] = useState<number | null>(null);

  const fetchUptime = () => {
    axios
      .get("/onepulse/api/uptime")
      .then((res) => setUptime(res.data.uptime))
      .catch(() => setUptime(null));
  };

  useEffect(() => {
    fetchUptime(); // initial fetch
    const interval = setInterval(fetchUptime, 1000); // refresh every 1s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 w-full max-w-6xl mx-auto">
      <h2
        className="text-2xl font-semibold mb-4"
        style={{ color: theme.heading.yellow }}
      >
        Uptime
      </h2>

      <div
        className="flex flex-col justify-between rounded-lg shadow-md border-2"
        style={{
          borderColor: theme.heading.yellow,
          backgroundColor: "#1e1e1e", // match services card bg
          padding: "1.25rem",
          fontSize: "1.05rem",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
        </div>
        <div>
          {uptime !== null ? (
            <span className="font-mono text-white">{formatUptime(uptime)}</span>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
