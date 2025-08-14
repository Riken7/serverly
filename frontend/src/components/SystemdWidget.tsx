import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "../theme";

interface Service {
  name: string;
  status: "active" | "inactive";
}

export function SystemdWidget() {
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<{ [key: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const fetchServices = () => {
    axios
      .get("/onepulse/api/services")
      .then((res) => setServices(res.data.services || []))
      .catch((err) => console.error(err));
  };

  const fetchLogs = (serviceName: string) => {
    axios
      .get(`/onepulse/api/services/logs/${serviceName}`)
      .then((res) =>
        setLogs((prev) => ({ ...prev, [serviceName]: res.data }))
      )
      .catch((err) => setLogs((prev) => ({ ...prev, [serviceName]: "Failed to load logs" })));
  };

  useEffect(() => {
    axios.get("/onepulse/api/config").then((res) => {
      if (res.data?.refreshInterval) {
        setRefreshInterval(res.data.refreshInterval * 1000);
      }
    });

    fetchServices();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchServices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const toggleExpand = (serviceName: string) => {
    setExpanded((prev) => {
      const newState = { ...prev, [serviceName]: !prev[serviceName] };
      if (!logs[serviceName] && !prev[serviceName]) {
        fetchLogs(serviceName);
      }
      return newState;
    });
  };

  return (
    <div className="mt-6 w-full">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.heading.blue }}>
        Services
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex flex-col justify-between rounded-lg shadow-md border-2 cursor-pointer"
            style={{
              borderColor: service.status === "active" ? "#22c55e" : "#ef4444",
              backgroundColor: "#1e1e1e",
              padding: "1.25rem",
              fontSize: "1.05rem",
            }}
            onClick={() => toggleExpand(service.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{service.name}</span>
              <span
                className={`h-3 w-3 rounded-full ${
                  service.status === "active"
                    ? theme.statusColor.active
                    : theme.statusColor.inactive
                }`}
              />
            </div>
            <div>
              Status:{" "}
              <span
                className={
                  service.status === "active"
                    ? "text-green-400 font-semibold"
                    : "text-red-400 font-semibold"
                }
              >
                {service.status}
              </span>
            </div>

            {expanded[service.name] && (
              <pre
                className="mt-2 p-2 bg-black text-xs overflow-x-auto rounded"
                style={{ maxHeight: "200px", fontFamily: "monospace" }}
              >
                {logs[service.name] || "Loading logs..."}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
