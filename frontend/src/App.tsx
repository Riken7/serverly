import { useEffect, useState } from "react";
import axios from "axios";
import { theme } from "./theme";
import { StatsWidget } from "./components/StatsWidget";
import { DiskWidget } from "./components/DiskWidget";
import { UptimeWidget } from "./components/UptimeWidget";
import { DockerWidget } from "./components/DockerWidget";
import { SystemdWidget } from "./components/SystemdWidget";

interface Config {
  refreshInterval: number;
  sections: {
    stats?: boolean;
    disk?: boolean;
    uptime?: boolean;
    docker?: {
      enabled: boolean;
    }
    services?: {
      enabled: boolean;
    };
  };
}

function App() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    axios.get("/onepulse/api/config").then((res) => setConfig(res.data));
  }, []);

  if (!config) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          fontFamily: theme.fontFamily,
        }}
      >
        Loading config...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white font-sans py-6 px-6 sm:px-8 md:px-12"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl font-bold text-center mb-10 py-4 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            color: theme.heading.green,
            fontWeight: 800,
            letterSpacing: "0.05em",
          }}
        >
          Serverly
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.sections.stats && <StatsWidget />}
          {config.sections.disk && <DiskWidget />}
          {config.sections.uptime && <UptimeWidget />}
          {config.sections.docker?.enabled && <DockerWidget />}
          {config.sections.services?.enabled && <SystemdWidget />}
        </div>
      </div>
    </div>
  );
}

export default App;
