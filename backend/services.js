const { exec } = require("child_process");

function listServices(config, res) {
  if (!config.sections.services || !config.sections.services.enabled) {
    return res.json({ services: [] });
  }

  const filters = config.sections.services.filter || [];
  if (filters.length === 0) {
    return res.json({ services: [] });
  }

  const results = [];
  let completed = 0;

  filters.forEach(service => {
    exec(`systemctl is-active ${service}.service`, (err, stdout) => {
      let status = stdout.trim() || "inactive";
      if (err && status === "") {
        status = "unknown";
      }
      results.push({ name: service, status });
      completed++;

      if (completed === filters.length) {
        res.json({ services: results });
      }
    });
  });
}
function getServiceLogs(req, res) {
  const serviceName = req.params.name;
  exec(`systemctl status ${serviceName}.service`, (err, stdout) => {
    if (err && !stdout) {
      return res.status(500).send("Failed to get logs");
    }
    res.type("text/plain").send(stdout);
  });
}

module.exports = {
  listServices,
  getServiceLogs
};
