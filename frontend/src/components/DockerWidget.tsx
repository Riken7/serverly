import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

interface DockerContainer {
  name: string;
  status: "running" | "stopped";
}

export function DockerWidget() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [logs, setLogs] = useState<{ [key: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const fetchContainers = () => {
    axios
      .get("/onepulse/api/docker")
      .then((res) => setContainers(res.data.containers || []))
      .catch((err) => console.error(err));
  };

  const fetchLogs = (containerName: string) => {
    axios
      .get(`/onepulse/api/docker/logs/${containerName}`)
      .then((res) =>
        setLogs((prev) => ({ ...prev, [containerName]: res.data }))
      )
      .catch(() =>
        setLogs((prev) => ({ ...prev, [containerName]: "Failed to load logs" }))
      );
  };

  useEffect(() => {
    axios.get("/onepulse/api/config").then((res) => {
      if (res.data?.refreshInterval) {
        setRefreshInterval(res.data.refreshInterval * 1000);
      }
    });

    fetchContainers();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchContainers, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const toggleExpand = (containerName: string) => {
    setExpanded((prev) => {
      const newState = { ...prev, [containerName]: !prev[containerName] };
      if (!logs[containerName] && !prev[containerName]) {
        fetchLogs(containerName);
      }
      return newState;
    });
  };

  return (
    <div className="mt-6 w-full">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.heading.purple }}>
        Docker Containers
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {containers.map((container) => (
          <div
            key={container.name}
            className="flex flex-col justify-between rounded-lg shadow-md border-2 cursor-pointer"
            style={{
              borderColor:
                container.status === "running" ? "#22c55e" : "#ef4444",
              backgroundColor: "#1e1e1e",
              padding: "1.25rem",
              fontSize: "1.05rem",
            }}
            onClick={() => toggleExpand(container.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{container.name}</span>
              <span
                className={`h-3 w-3 rounded-full ${
                  container.status === "running"
                    ? theme.statusColor.active
                    : theme.statusColor.inactive
                }`}
              />
            </div>
            <div>
              Status:{" "}
              <span
                className={
                  container.status === "running"
                    ? "text-green-400 font-semibold"
                    : "text-red-400 font-semibold"
                }
              >
                {container.status}
              </span>
            </div>

            {expanded[container.name] && (
              <pre
                className="mt-2 p-2 bg-black text-xs overflow-x-auto rounded"
                style={{ maxHeight: "200px", fontFamily: "monospace" }}
              >
                {logs[container.name] || "Loading logs..."}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
